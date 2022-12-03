from flask import Flask,jsonify,request,redirect
import mysql.connector as mysql
from cryptography.fernet import Fernet
from flask_cors import CORS
import json
from datetime import datetime
import random
import os
from werkzeug.utils import secure_filename

app=Flask(__name__)
db_name = "AJCL"
db_password = "root"
db_user = "root"
db_host = "127.0.0.1"
key=b'i3vVJAiA2-e6JIBoTBwvmQNmTXvVhbr60p5jOYVRVws='

CORS(app)

def database():
    db = mysql.connect(host=db_host, user=db_user, passwd=db_password, database=db_name)
    cursor=db.cursor(buffered=True)
    return db,cursor

@app.route("/api/aviation/",methods=["GET","POST"])
def home():
    return jsonify({"response":"access"})

@app.route("/api/aviation/getAllUsers/",methods=["GET","POST"])
def getAllUsers():
    db,cursor = database()
    query="select * from usersdata"
    cursor.execute(query)
    result=cursor.fetchall()
    return jsonify({"response":result})

@app.route("/api/aviation/registerUser/",methods=["GET","POST"])
def registerUser():
    db,cursor = database()
    data=request.form
    if data:
        query1="select * from usersdata where email=%s"
        cursor.execute(query1,(data["email"],))
        result1=cursor.fetchone()
        #print(result1)
        if result1:return jsonify({"response":"Email Already Exist"})
        else:
            password=data["password"].encode()
            f = Fernet(key)
            encryptedPassword = f.encrypt(password)
            query2="insert into usersData(email,department,password,authKey) values(%s,%s,%s,%s)"
            cursor.execute(query2,(data["email"],data["department"],encryptedPassword,data["authCode"]))
            db.commit()
            return "<script>alert('Employee Registered Successfully');location.reload();</script>"
    else:return jsonify({"response":"Invalid Information"})

@app.route("/api/aviation/login/",methods=["GET","POST"])
def login():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    #print(data["email"])
    if data:
        query1="select * from usersdata where email=%s and authKey=%s"
        cursor.execute(query1,(data["email"],data["authCode"]))
        result1=cursor.fetchone()
        if result1:
            password=bytes(result1[3], 'utf-8')
            f = Fernet(key)
            passw = f.decrypt(password)
            passw=passw.decode("utf-8")
            if passw==data["password"]:return jsonify({"response":"success","department":str(result1[2])})
            else:return jsonify({"response":"Incorrect Password"})
        else:return jsonify({"response":"Invalid Email or Password"})
    else:return jsonify({"response":"Invalid Email or Password"})

@app.route("/api/aviation/getUserInfo/<email>",methods=["GET","POST"])
def getUserInfo(email):
    db,cursor = database()
    query1="select email,department,post,name,age,loc from usersdata where email=%s"
    cursor.execute(query1,(email,))
    result=cursor.fetchone()
    response={}
    if result:
        response={"email":result[0],"department":result[1],"post":result[2],"name":result[3],"age":result[4],"loc":result[5]}
    for k,v in enumerate(response):
        if response[v]=="":response[v]="--"
    return jsonify({"response":response})

def rfqCodeGenerator(customer):
    db,cursor = database()
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    temp=list(customer)
    temp2=[ord(i) for i in temp]
    code=""
    for i in temp2:code=code+str(i)
    temp3=random.randint(1000, 9999)
    code=code+str(temp3)+str(currentYear)+str(currentMonth)
    query="select id from rfq where rfqNoSG=%s"
    cursor.execute(query,(code,))
    result=cursor.fetchone()
    if result:rfqCodeGenerator(customer)
    else:return code

@app.route("/api/aviation/addRFQ/",methods=["GET","POST"])
def addRFQ():
    db,cursor = database()
    data=request.get_data()
    data = json.loads(data)
    code=rfqCodeGenerator(data["customer"])
    query0="select id from rfq where rEQNumber=%s"
    cursor.execute(query0,(data["rfqNo"],))
    result=cursor.fetchone()
    if result:return jsonify({"response":"exist"})
    else:
        partNo=[]
        temp=data["partNo"].split(",")
        temp2=data["nsn"].split(",")
        count=0
        for i in temp:
            query="select id from bom where partNo=%s"
            cursor.execute(query,(i,))
            result2=cursor.fetchone()
            partNo.append(str(result2[0]))
            query2="insert into itemstatus(partNo, rfqNo, status) values(%s,%s,%s)"
            values2=(result2[0],data["rfqNo"],"Not Recieved")
            cursor.execute(query2,values2)
            db.commit()
            query3="update bom set nsn=%s where id=%s"
            values3=(temp2[count],result2[0])
            cursor.execute(query3,values3)
            db.commit()
        partNoTemp=",".join(partNo)
        query="insert into rfq(rEQNumber,rEQCategory,rEQType,rEQDate,partNumber,partDescription,substitue,unitOfMeasurement,quantity,rFQStatus,deliveryDate,customer,rfqNoSG,fileLoc) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        values=(data["rfqNo"],data["rfqCategory"],data["rfqType"],data["reqDate"],partNoTemp,"","","",data["qty"],"Not Recieved",data["deliveryDate"],data["customer"],code,code)
        cursor.execute(query,values)
        db.commit()
        return jsonify({"response":"sucess","code":str(code)})

@app.route("/api/aviation/uploadRFQDocument/<code>",methods=["GET","POST"])
def uploadRFQDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update rfq set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/aviation/getBOM/<customer>",methods=["GET","POST"])
def getBOM(customer):
    db,cursor = database()
    query="select id,partNo,nomenclature,customer,nsn from bom where customer=%s"
    cursor.execute(query,(customer,))
    result=cursor.fetchall()
    ##print(result)
    response=[]
    if result:
        for row in result:
            temp={"id":row[0],"partNo":row[1],"nomanclature":row[2],"customer":row[3],"nsn":row[4]}
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/aviation/getOfferBOM/<rfq>",methods=["GET","POST"])
def getRFQBOM(rfq):
    db,cursor = database()
    query0="select customer from rfq where rEQNumber=%s"
    cursor.execute(query0,(rfq,))
    result0=cursor.fetchone()
    query="select id,partNo,nomenclature,customer,nsn from bom where customer=%s"
    cursor.execute(query,(result0[0],))
    result=cursor.fetchall()
    #print(result)
    response=[]
    if result:
        for row in result:
            temp={"id":row[0],"partNo":row[1],"nomanclature":row[2],"customer":row[3],"nsn":row[4]}
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/aviation/addItemToBOM/",methods=["GET","POST"])
def addItemToBOM():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    query0="select id from bom where partNo=%s"
    cursor.execute(query0,(data["partNo"],))
    result=cursor.fetchone()
    if result:
        return jsonify({"response":"exist"})
    else:
        query="insert into bom(partNo, nomenclature, unitOfMeasurement, alternatePartNo, unitPrice, currency, customer) values(%s,%s,%s,%s,%s,%s,%s)"
        cursor.execute(query,(data["partNo"],data["nomenclature"],data["uom"],data["alternate"],data["unitPrice"],data["currency"],data["company"]))
        db.commit()
        return jsonify({"response":"success"})
    return jsonify({"response":"success"})

@app.route("/api/aviation/getRFQs/",methods=["GET","POST"])
def getRFQs():
    db,cursor = database()
    query="select * from rfq order by id desc"
    cursor.execute(query)
    result=cursor.fetchall()
    response=[]
    items=[]
    if result:
        for row in result:
            document="D:/docsTemp/"+str(row[14])
            rowtemp={"id":row[0], "rEQNumber":row[1], "rEQCategory":row[2], "rEQType":row[3], "rEQDate":row[4], "partNumber":row[5], "partDescription":row[6], "substitue":row[7], "unitOfMeasurement":row[8], "rFQStatus":row[9], "deliveryDate":row[10], "quantity":row[11],"customer":row[12],"rfqNoSG":row[13],"document":document}
            quantities=row[11].split(",")
            temp2=row[5].split(",")
            #print(temp2)
            item={}
            temp4=[]
            count=0
            for id in temp2:
                query2="select partNo,nomenclature,id from bom where id=%s"
                cursor.execute(query2,(id,))
                result2=cursor.fetchone()
                temp3=[]
                if result2:
                    temp3.append(result2[0])
                    temp3.append(result2[1])
                    query3="select status from itemstatus where rfqNo=%s and partNo=%s"
                    cursor.execute(query3,(row[1],result2[2]))
                    result3=cursor.fetchone()
                    #print(result3)
                    if result3:
                        temp3.append(result3[0])
                    temp3.append(quantities[count])
                    query4="select offerNumber,unitOfMeasure,quantity,price,id from offer where rfqNumber=%s and partNo=%s"
                    cursor.execute(query4,(row[1],result2[0]))
                    result4=cursor.fetchone()
                    if result4:
                        temp={"offerNumber":result4[0],"unitOfMeasure":result4[1],"quantity":result4[2],"price":result4[3],"id":result4[4]}
                        item[result2[0]]=temp
                    else:
                        item[result2[0]]="Not Recieved"
                    temp4.append(result2[0])
                try:item[row[1]].append(temp3)
                except:item[row[1]]=[temp3]
                count+=1
            items.append(item)
            rowtemp["itemSet"]=temp4
            response.append(rowtemp)
    return jsonify({"response":response,"items":items})

@app.route("/api/aviation/addOffer/",methods=["GET","POST"])
def addOffer():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    #print(data)
    query00="select id from offer where offerNumber=%s"
    cursor.execute(query00,(data["offerNo"],))
    result00=cursor.fetchone()
    if result00:
        return jsonify({"response":"exist","reference":"#"})
    else:
        query0="select id,unitOfMeasurement from bom where partNo=%s"
        cursor.execute(query0,(data["partNo"],))
        result0=cursor.fetchone()
        code=""
        if result0:
            if data["offerInlieusStatus"]=="true":
                query="insert into inlieusItems(partNo,qty) values(%s,%s);"
                cursor.execute(query,(data["lieuPartNumber"],data["qtyLieu"]))
                db.commit()
                query="SELECT LAST_INSERT_ID()"
                cursor.execute(query)
                result2=cursor.fetchone()
                alternate=result2[0]
                qty=data["qtyLieu"]
            else:
                alternate="-"
                qty=data["qty"]
            totalPrice=float(data["unitPrice"])*int(qty)
            totalPrice=round(totalPrice, 2)
            if data["rfqType"]=="ro":
                discount=((float(data["offerDiscount"])/100)*float(data["unitPrice"]))
                discount=round(discount, 2)
            else:
                discount=(float(data["offerDiscount"])/100)*totalPrice
                discount=round(discount, 2)
            discountPrice=totalPrice-discount
            discountPrice=round(discountPrice, 2)
            offerFreightCharges=(float(data["offerFreightCharges"])/100)*discountPrice
            offerFreightCharges=round(offerFreightCharges, 2)
            finalPrice=offerFreightCharges+discountPrice
            finalPrice=round(finalPrice, 2)
            offerFrieghtChargersWithUnitPrice=finalPrice/int(qty)
            offerFrieghtChargersWithUnitPrice=round(offerFrieghtChargersWithUnitPrice, 2)
            currentMonth = datetime.now().month
            currentYear = datetime.now().year
            code=str(data["offerNo"])+str(random.randint(100000, 999999))+str(currentMonth)+str(currentYear)
            query="insert into offer(offerNumber, date, validity, alternate, quantity, unitOfMeasure, price, totalAmount, discount, discountPercentage, offerFrieghtChargers, offerFrieghtChargersPercentage, offerFinalPrice, offerUnitPriceWithFreight, deliveryDateAsPerLHDOffer, status, rfqNumber, partNo,fileLoc) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            values=(data["offerNo"],data["date"],data["validityDate"],alternate,qty,result0[1],data["unitPrice"],totalPrice,discount,data["offerDiscount"],offerFreightCharges,data["offerFreightCharges"],finalPrice,offerFrieghtChargersWithUnitPrice,str(data["validityDate"]),"Not Recieved",data["rfqNo"],data["partNo"],code)
            cursor.execute(query,values)
            db.commit()
            query3="update itemstatus set status=%s where partNo=%s and rfqNo=%s"
            cursor.execute(query3,("Recieved",result0[0],data["rfqNo"]))
            db.commit()
        return jsonify({"response":"success","reference":code})

@app.route("/api/aviation/uploadOfferDocument/<code>",methods=["GET","POST"])
def uploadOfferDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update offer set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/aviation/getOfferDetails/<id>",methods=["GET","POST"])
def getOfferDetails(id):
    db,cursor = database()
    query="select * from offer where id=%s"
    cursor.execute(query,(id,))
    result=cursor.fetchone()
    columns=["id", "offerNumber", "date", "validity", "alternate", "quantity", "unitOfMeasure", "price", "totalAmount", "discount", "discountPercentage", "offerFrieghtChargers", "offerFrieghtChargersPercentage", "offerFinalPrice", "offerUnitPriceWithFreight", "deliveryDateAsPerLHDOffer", "itemOfferStatus", "rfqNumber", "partNo", "fileLoc"]
    response={}
    for i in range(1,len(result)):
        if columns[i]=='fileLoc':
            document="D:/docsTemp/"+str(result[i])
            response[columns[i]]=document
        else:response[columns[i]]=result[i]
    query="select status from itemstatus where rfqNo=%s and partNo in (select id from bom where partNo=%s)"
    cursor.execute(query,(response['rfqNumber'],response['partNo']))
    result2=cursor.fetchone()
    response['itemOfferStatus']=result2[0]
    if response["alternate"]=="-":pass
    else:
        query3="select partNo from inlieusitems where id=%s"
        cursor.execute(query3,(response["alternate"],))
        result3=cursor.fetchone()
        response["alternate"]=result3[0]
    return jsonify({"response":response})

@app.route("/api/aviation/searchRFQ/",methods=["GET","POST"])
def searchRFQ():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    fields=["rEQNumber","rEQCategory","rEQType","rEQDate","deliveryDate","rfqNoSG","customer",'rfqNoSG']
    query0="select * from rfq where "
    count=0
    for i in fields:
        if(len(fields)==count+1):
            query0=query0+str(i)+" like '%"+data['search']+"%' order by id desc"
        else:
            query0=query0+str(i)+" like '%"+data['search']+"%' or "
        count+=1
    cursor.execute(query0)
    result=cursor.fetchall()
    response=[]
    items=[]
    query1="select id from bom where partNo like '%"+data['search']+"%' or nomenclature like '%"+data['search']+"%'"
    cursor.execute(query1)
    result2=cursor.fetchall()
    if result2:
        for i in result2:
            query3="select * from rfq where partNumber like '%"+str(i[0])+"%' order by id desc"
            cursor.execute(query3)
            result3=cursor.fetchall()
            result=result+result3
    query4="select rfqNo from itemstatus where status like '%"+data['search']+"%'"
    cursor.execute(query4)
    result4=cursor.fetchall()
    if result4:
        for i in result4:
            query5="select * from rfq where rEQNumber=%s order by id desc"
            cursor.execute(query5,(i[0],))
            result5=cursor.fetchall()
            result=result+result5
            #print(result4)
    #print(type(result))
    if result:
        result=[tuple(i) for i in result]
        result=tuple(result)
        result=tuple(set(result))
        for row in result:
            document="D:/docsTemp/"+str(row[14])
            rowtemp={"id":row[0], "rEQNumber":row[1], "rEQCategory":row[2], "rEQType":row[3], "rEQDate":row[4], "partNumber":row[5], "partDescription":row[6], "substitue":row[7], "unitOfMeasurement":row[8], "rFQStatus":row[9], "deliveryDate":row[10], "quantity":row[11],"customer":row[12],"rfqNoSG":row[13],"document":document}
            quantities=row[11].split(",")
            temp2=row[5].split(",")
            #print(temp2)
            item={}
            temp4=[]
            count=0
            for id in temp2:
                query2="select partNo,nomenclature,id from bom where id=%s"
                cursor.execute(query2,(id,))
                result2=cursor.fetchone()
                temp3=[]
                if result2:
                    temp3.append(result2[0])
                    temp3.append(result2[1])
                    query3="select status from itemstatus where rfqNo=%s and partNo=%s"
                    cursor.execute(query3,(row[1],result2[2]))
                    result3=cursor.fetchone()
                    #print(result3)
                    if result3:
                        temp3.append(result3[0])
                    temp3.append(quantities[count])
                    query4="select offerNumber,unitOfMeasure,quantity,price from offer where rfqNumber=%s and partNo=%s"
                    cursor.execute(query4,(row[1],result2[0]))
                    result4=cursor.fetchone()
                    if result4:
                        temp={"offerNumber":result4[0],"unitOfMeasure":result4[1],"quantity":result4[2],"price":result4[3]}
                        item[result2[0]]=temp
                    else:
                        item[result2[0]]="Not Recieved"
                    temp4.append(result2[0])
                try:item[row[1]].append(temp3)
                except:item[row[1]]=[temp3]
                count+=1
            items.append(item)
            rowtemp["itemSet"]=temp4
            response.append(rowtemp)
    return jsonify({"response":response,"items":items})

@app.route("/api/aviation/getRfqOfferItems/<customer>",methods=["GET","POST"])
def getRfqOfferItems(customer):
    db,cursor = database()
    query="select partNo,status,rfqNo,id from itemstatus where status=%s or status=%s"
    cursor.execute(query,('Recieved','Not Recieved'))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            query="select id,partNo,nomenclature,customer from bom where id=%s"
            cursor.execute(query,(row[0],))
            result2=cursor.fetchone()
            query4="select rfqNoSG,partNumber,quantity from rfq where rEQNumber=%s"
            cursor.execute(query4,(row[2],))
            result4=cursor.fetchone()
            tempRfqQuantuties=result4[2].split(",")
            tempRfqQuantuties=list(tempRfqQuantuties)
            tempRfqPartNo=result4[1].split(",")
            tempRfqPartNo=list(tempRfqPartNo)
            #print("validate")
            #print(tempRfqPartNo,tempRfqQuantuties)
            if result2:
                category=""
                if result2[3]==customer:
                    if row[1]=='Recieved':
                        category='Offer'
                        query3="select quantity,offerNumber,alternate,discountPercentage,offerFrieghtChargersPercentage,price from offer where partNo=%s and rfqNumber=%s"
                        cursor.execute(query3,(result2[1],row[2]))
                        result3=cursor.fetchone()
                        if result3:pass
                        else:
                            category='RFQ'
                            result3=[0]
                    else:
                        category='RFQ'
                        result3=[0]
                    #print(row)
                    #print(result)
                    #print(result2)
                    #print(result3)
                    if category=="RFQ":
                        try:
                            #print(result4)
                            #print(tempRfqPartNo)
                            tempIndex=tempRfqPartNo.index(str(row[0]))
                            tempQuantity=tempRfqQuantuties[tempIndex]
                        except:tempQuantity=0
                        temp={"id":row[3],"partNo":result2[1],"lieusPartNo":"No Offer Recieved","nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":tempQuantity,"sgRFQ":result4[0],"discountPercentage":0,"offerFrieghtChargersPercentage":0,"price":0}
                    else:
                        if result3[2]=="-":
                            temp={"id":row[3],"lieusPartNo":"-","partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":result3[0],"offerNo":result3[1],"sgRFQ":result4[0],"discountPercentage":result3[3],"offerFrieghtChargersPercentage":result3[4],"price":result3[5]}                        
                        else:
                            query5="select partNo,qty from inlieusitems where id=%s"
                            cursor.execute(query5,(result3[2],))
                            result5=cursor.fetchone()
                            temp={"id":row[3],"lieusPartNo":result5[0],"partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":result5[1],"offerNo":result3[1],"sgRFQ":result4[0],"discountPercentage":result3[3],"offerFrieghtChargersPercentage":result3[4],"price":result3[5]}
                    response.append(temp)
                else:pass
    return jsonify({"response":response})

@app.route("/api/aviation/getRfqOfferItemsAmended/<customer>/<id>",methods=["GET","POST"])
def getRfqOfferItemsAmended(customer,id):
    db,cursor = database()
    query="select partNo,status,rfqNo,id,poId from itemstatus where poId=%s or poId=0"
    cursor.execute(query,(id,))
    result=cursor.fetchall()
    #print(id)
    query5="select partNo,quantity,discountPercent,discountAmount,frieghtCharges,frieghtPercent,price from poitems where poNumber in (select number from po where id=%s)"
    cursor.execute(query5,(id,))
    result5=cursor.fetchall()
    poItems=[]
    reviseOfferItems=[]
    if result5:
        for row in result5:
            # partNo=row[0].split(" | ")
            temp={"partNo":row[0],"quantity":row[1],"discountPercent":row[2],"discountAmount":row[3],"frieghtCharges":row[4],"frieghtPercent":row[5],"price":row[6]}
            if row[0].find(" | ")!=-1:
                pn=row[0].split(" | ")
                query10="select nomenclature from bom where partNo=%s"
                cursor.execute(query10,(pn[0],))
                result10=cursor.fetchone()
                temp["nomenclature"]=result10[0]
                reviseOfferItems.append(temp)
            else:
                poItems.append(temp)
    response=[]
    #print(result)
    #print(result5)
    if result:
        for row in result:
            query="select id,partNo,nomenclature,customer from bom where id=%s"
            cursor.execute(query,(row[0],))
            result2=cursor.fetchone()
            itemStatus=False
            itemPositionCount=0
            for i in poItems:
                if i["partNo"]==result2[1]:
                    #print("Found",i)
                    itemStatus=True
                    break
                itemPositionCount+=1
            #print(itemPositionCount)
            query4="select rfqNoSG,partNumber,quantity from rfq where rEQNumber=%s"
            cursor.execute(query4,(row[2],))
            result4=cursor.fetchone()
            tempRfqQuantuties=result4[2].split(",")
            tempRfqQuantuties=list(tempRfqQuantuties)
            tempRfqPartNo=result4[1].split(",")
            tempRfqPartNo=list(tempRfqPartNo)
            if result2:
                category=""
                if result2[3]==customer:
                    if row[1]=='Recieved':
                        category='Offer'
                        query3="select quantity,offerNumber,alternate,discountPercentage,offerFrieghtChargersPercentage,price from offer where partNo=%s and rfqNumber=%s"
                        cursor.execute(query3,(result2[1],row[2]))
                        result3=cursor.fetchone()
                        tempRfqQuantuties=result4[2].split(",")
                        tempRfqQuantuties=list(tempRfqQuantuties)
                        tempRfqPartNo=result4[1].split(",")
                        tempRfqPartNo=list(tempRfqPartNo)
                        if result3:pass
                        else:
                            category='RFQ'
                            result3=[0]
                    else:
                        category='RFQ'
                        result3=[0]
                    # #print(row)
                    # #print(result)
                    # #print(result2)
                    # #print(result3)
                    if category=="RFQ":
                        try:
                            # #print(result4)
                            # #print(tempRfqPartNo)
                            tempIndex=tempRfqPartNo.index(str(row[0]))
                            tempQuantity=tempRfqQuantuties[tempIndex]
                        except:tempQuantity=0
                        if itemStatus:
                            temp={"id":row[3],"lieusPartNo":"No Offer Recieved","partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":poItems[itemPositionCount]["quantity"],"sgRFQ":result4[0],"discountPercentage":poItems[itemPositionCount]["discountPercent"],"offerFrieghtChargersPercentage":poItems[itemPositionCount]["frieghtPercent"],"price":poItems[itemPositionCount]["price"],"poId":row[4]}
                        else:    
                            temp={"id":row[3],"lieusPartNo":"No Offer Recieved","partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":tempQuantity,"sgRFQ":result4[0],"discountPercentage":0,"offerFrieghtChargersPercentage":0,"price":0,"poId":row[4]}
                    else:
                        if result3[2]=="-":
                            if itemStatus:
                                temp={"id":row[3],"lieusPartNo":"-","partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":poItems[itemPositionCount]["quantity"],"offerNo":result3[1],"sgRFQ":result4[0],"discountPercentage":poItems[itemPositionCount]["discountPercent"],"offerFrieghtChargersPercentage":poItems[itemPositionCount]["frieghtPercent"],"price":poItems[itemPositionCount]["price"],"poId":row[4]}                        
                            else:
                                temp={"id":row[3],"lieusPartNo":"-","partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":result3[0],"offerNo":result3[1],"sgRFQ":result4[0],"discountPercentage":result3[3],"offerFrieghtChargersPercentage":result3[4],"price":result3[5],"poId":row[4]}                        
                        else:
                            query5="select partNo,qty from inlieusitems where id=%s"
                            cursor.execute(query5,(result3[2],))
                            result5=cursor.fetchone()
                            if itemStatus:
                                temp={"id":row[3],"lieusPartNo":result5[0],"partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":poItems[itemPositionCount]["quantity"],"offerNo":result3[1],"sgRFQ":result4[0],"discountPercentage":poItems[itemPositionCount]["discountPercent"],"offerFrieghtChargersPercentage":poItems[itemPositionCount]["frieghtPercent"],"price":poItems[itemPositionCount]["price"],"poId":row[4]} 
                            else:
                                temp={"id":row[3],"lieusPartNo":result5[0],"partNo":result2[1],"nomenclature":result2[2],"category":category,"rfq":row[2],"quantity":result5[1],"offerNo":result3[1],"sgRFQ":result4[0],"discountPercentage":result3[3],"offerFrieghtChargersPercentage":result3[4],"price":result3[5],"poId":row[4]}
                    #print(temp)
                    response.append(temp)
                else:pass
        for i in reviseOfferItems:
            response.append(i)
    return jsonify({"response":response})

@app.route("/api/aviation/addPO/",methods=["GET","POST"])
def addPO():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    query0="select id from po where number=%s"
    cursor.execute(query0,(data['no'],))
    result0=cursor.fetchone()
    if result0:return jsonify({"response":"exist"})
    else:
        #print(data)
        totalAmount=0
        for i in range(len(data["quantity"])):
            #print(data['discounts'][i])
            temp=(float(data['discounts'][i])/100)*float(data["prices"][i])
            temp2=int(data["quantity"][i])*float(data["prices"][i])
            temp3=temp2-temp
            temp4=temp3+(temp3*(float(data["frieght"][i])/100))
            totalAmount=totalAmount+temp4
            totalAmount=round(totalAmount, 2)
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        code=str(data['no'])+str(random.randint(10000, 99999))+str(currentMonth)+str(currentYear)
        query="insert into po(number,date,totalAmount,customer,deliveryPeriod,fileLoc) values(%s,%s,%s,%s,%s,%s)"
        cursor.execute(query,(data['no'],data['date'],totalAmount,data['customer'],data["delivery"],code))
        db.commit()
        query0="select id from po order by id desc limit 1"
        cursor.execute(query0)
        result0=cursor.fetchone()
        count=0
        for i in data["items"]:
            query="select partNo,rfqNo,status from itemstatus where id=%s"
            cursor.execute(query,(int(i),))
            result=cursor.fetchone()
            if result:
                query="select partNo,nomenclature from bom where id=%s"
                cursor.execute(query,(result[0],))
                result2=cursor.fetchone()
                partNo=result2[0]
                if result[2]=="Recieved":
                    queryTemp="select alternate from offer where rfqNumber=%s and partNo=%s"
                    cursor.execute(queryTemp,(result[1],result2[0]))
                    resultTemp=cursor.fetchone()
                    if resultTemp[0]=="-":pass
                    else:
                        queryTemp2="select partNo from inlieusitems where id=%s"
                        cursor.execute(queryTemp2,(resultTemp[0],))
                        resultTemp2=cursor.fetchone()
                        partNo=partNo+" | "+resultTemp2[0]
                discount=(float(data['discounts'][count])/100)*float(data["prices"][count])
                discount=round(discount, 2)
                frieght=(float(data["prices"][count])-discount)*(float(data['frieght'][count])/100)
                frieght=round(frieght, 2)
                query="insert into poitems(poNumber, partNo, nomenclature, quantity, reference, price, status, discountAmount,discountPercent,frieghtCharges,frieghtPercent) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                values=(data["no"],partNo,result2[1],data['quantity'][count],result[1],round(float(data['prices'][count]),2),'Not Recieved',discount,round(float(data['discounts'][count]),2),frieght,data['frieght'][count])
                cursor.execute(query,values)
                db.commit()
                query="update itemstatus set status=%s,poId=%s where id=%s"
                cursor.execute(query,("PO Recieved",result0[0],i))
                db.commit()
            count+=1
        #print(totalAmount)
        return jsonify({"response":data,"code":code,"amount":totalAmount})

@app.route("/api/aviation/uploadPODocument/<code>",methods=["GET","POST"])
def uploadPODocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update po set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/aviation/getAllPOs/",methods=["GET","POST"])
def getAllPOs():
    db,cursor = database()
    query="select * from po order by id desc"
    cursor.execute(query)
    result=cursor.fetchall()
    po=[]
    items=[]
    if result:
        for row in result:
            temp={"id":row[0], "number":row[1], "date":row[2], "totalAmount":row[3],"customer":row[4],"status":row[5]}
            po.append(temp)
    query2="select * from poitems"
    cursor.execute(query2)
    result2=cursor.fetchall()
    if result2:
        count=0
        for row2 in result2:
            temp2={"id":row2[0], "poNumber":row2[1], "partNo":row2[2], "nomenclature":row2[3], "quantity":row2[4], "reference":row2[5], "price":row2[6], "status":row2[7]}
            items.append(temp2)
            count+=1
    return jsonify({"pos":po,"items":items})

@app.route("/api/aviation/searchPO/<search>",methods=["GET","POST"])
def searchPO(search):
    db,cursor = database()
    query="select DISTINCT(number) from po where number like %s or date like %s or customer like %s or number in (select poNumber from poitems where partNo like %s or status like %s or reference like %s or nomenclature like %s);"
    values=("%"+search+"%","%"+search+"%","%"+search+"%","%"+search+"%","%"+search+"%","%"+search+"%","%"+search+"%")
    cursor.execute(query,values)
    result=cursor.fetchall()
    #print(result)
    po=[]
    items=[]
    if result:
        for row0 in result:
            #print(row0)
            query="select * from po where number=%s"
            cursor.execute(query,(row0[0],))
            result=cursor.fetchall()
            if result:
                for row in result:
                    temp={"id":row[0], "number":row[1], "date":row[2], "totalAmount":row[3],"customer":row[4],"status":row[5]}
                    po.append(temp)
            query2="select * from poitems where poNumber=%s"
            cursor.execute(query2,(row0[0],))
            result2=cursor.fetchall()
            if result2:
                count=0
                for row2 in result2:
                    temp2={"id":row2[0], "poNumber":row2[1], "partNo":row2[2], "nomenclature":row2[3], "quantity":row2[4], "reference":row2[5], "price":row2[6], "status":row2[7]}
                    items.append(temp2)
                    count+=1
    return jsonify({"pos":po,"items":items})

@app.route("/api/aviation/getPODetail/<id>",methods=["GET","POST"])
def getPODetails(id):
    db,cursor = database()
    query="select * from po where id=%s"
    cursor.execute(query,(id,))
    result=cursor.fetchone()
    fileLoc="D:/docsTemp/"+str(result[7])
    po={"id":result[0], "number":result[1], "date":result[2], "totalAmount":result[3], "customer":result[4],"status":result[5],"delivery":result[6],"fileLoc":fileLoc}
    query="select * from poitems where poNumber=%s"
    cursor.execute(query,(result[1],))
    result2=cursor.fetchall()
    items=[]
    if result2:
        for row in result2:
            temp2={"id":row[0], "poNumber":row[1], "partNo":row[2], "nomenclature":row[3], "quantity":row[4], "reference":row[5], "price":row[6], "status":row[7],"discountPercent":row[8],"frieghtPercent":row[11]}
            items.append(temp2)
    ocItems=[]
    query3="select id, partNo, nomenclature, alternate, qunatity, price, discountPercent, discountAmount, frieghtPercent, status, fileLoc from ocitems where ocNumber in (select number from oc where poNumber=%s)"
    cursor.execute(query3,(result[1],))
    result3=cursor.fetchall()
    if result3:
        for row in result3:
            fileLoc="D:/docsTemp/"+row[10]
            temp3={"id":row[0], "partNo":row[1], "nomenclature":row[2], "alternate":row[3], "quantity":row[4], "price":row[5], "discountPercent":row[6], "frieghtPercent":row[8],"status":row[9],"fileloc":fileLoc}
            ocItems.append(temp3)
    query4="select totalAmount,fileLoc,number from oc where poNumber=%s"
    cursor.execute(query4,(result[1],))
    result4=cursor.fetchone()
    if result4:
        fileLoc="D:/docsTemp/"+str(result4[1])
        oc={"totalAmount":result4[0],"fileLoc":fileLoc,"ocNumber":result4[2]}
    else:
        oc={"totalAmount":"-","fileLoc":"-"}
    return jsonify({"po":po,"items":items,"ocItems":ocItems,"oc":oc})

@app.route("/api/aviation/getPO/<id>",methods=["GET","POST"])
def getPO(id):
    db,cursor = database()
    query="select * from po where id=%s"
    cursor.execute(query,(id,))
    result=cursor.fetchone()
    #print(result)
    po={"id":result[0], "number":result[1], "date":str(result[2]), "totalAmount":result[3], "customer":result[4],"deliveryPeriod":str(result[6])}
    query2="select partNo,reference from poitems where poNumber=%s"
    cursor.execute(query2,(result[1],))
    result2=cursor.fetchall()
    items=[]
    if result2:
        for row in result2:
            #partNo=row[0].split(" | ")
            tempStatus=row[0].find(" | ")
            if tempStatus!=-1:
                items.append(row[0])
            else:
                query3="select id from itemstatus where partNo in (select id from bom where partNo=%s);"
                cursor.execute(query3,(row[0],))
                result3=cursor.fetchone()
                print(result3)
                if result3:
                    items.append("item"+str(result3[0])+"rfq"+str(row[1]))
    return jsonify({"po":po,"items":items})

@app.route("/api/aviation/getOffer/<id>",methods=["GET","POST"])
def getOffer(id):
    db,cursor = database()
    query="select * from offer where id=%s"
    cursor.execute(query,(id,))
    result=cursor.fetchone()
    if result:
        response={"id":result[0], "offerNumber":result[1], "date":str(result[2]), "validity":str(result[3]), "alternate":result[4], "quantity":result[5], "unitOfMeasure":result[6], "price":result[7], "totalAmount":result[8], "discountPercentage":result[9], "discount":result[10], "offerFrieghtChargers":result[11], "offerFrieghtChargersPercentage":result[12], "offerFinalPrice":result[13], "offerUnitPriceWithFreight":result[14], "deliveryDateAsPerLHDOffer":result[15], "status":result[16], "rfqNumber":result[17], "partNo":result[18]}
        if result[4]!="-":
            ##print(result[4])
            query2="select * from inlieusitems where id=%s"
            cursor.execute(query2,(result[4],))
            result2=cursor.fetchone()
            ##print(result2)
            if result2:
                response["lieusPartNo"]=result2[1]
                response["lieusQuantity"]=result2[2]
        return jsonify({"response":response})
    else:return jsonify({"response":""})

@app.route("/api/aviation/reviseOffer/",methods=["GET","POST"])
def reviseOffer():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    query0="select id,unitOfMeasurement from bom where partNo=%s"
    cursor.execute(query0,(data["partNo"],))
    result0=cursor.fetchone()
    code=""
    if result0:
        if data["offerInlieusStatus"]=="true":
            query00="select alternate from offer where offerNumber=%s"
            cursor.execute(query00,(data["offerNo"],))
            result00=cursor.fetchone()
            query="update inlieusItems set partNo=%s,qty=%s where id=%s"
            cursor.execute(query,(data["lieuPartNumber"],data["qtyLieu"],result00[0]))
            db.commit()
            alternate=result00[0]
            qty=data["qtyLieu"]
        else:
            alternate="-"
            qty=data["qty"]
        query01="select rEQType from rfq where rEQNumber=%s"
        cursor.execute(query01,(data["rfqNo"],))
        result01=cursor.fetchone()
        data["rfqType"]=result01[0]
        totalPrice=float(data["unitPrice"])*int(qty)
        totalPrice=round(totalPrice, 2)
        if data["rfqType"]=="ro":
            discount=((float(data["offerDiscount"])/100)*float(data["unitPrice"]))
            discount=round(discount, 2)
        else:
            discount=(float(data["offerDiscount"])/100)*totalPrice
            discount=round(discount, 2)
        discountPrice=totalPrice-discount
        discountPrice=round(discountPrice, 2)
        offerFreightCharges=(float(data["offerFreightCharges"])/100)*discountPrice
        offerFreightCharges=round(offerFreightCharges, 2)
        finalPrice=offerFreightCharges+discountPrice
        finalPrice=round(finalPrice, 2)
        offerFrieghtChargersWithUnitPrice=finalPrice/int(qty)
        offerFrieghtChargersWithUnitPrice=round(offerFrieghtChargersWithUnitPrice, 2)
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        code=str(data["offerNo"])+str(random.randint(100000, 999999))+str(currentMonth)+str(currentYear)
        #query="insert into offer(offerNumber, date, validity, alternate, quantity, unitOfMeasure, price, totalAmount, discount, discountPercentage, offerFrieghtChargers, offerFrieghtChargersPercentage, offerFinalPrice, offerUnitPriceWithFreight, deliveryDateAsPerLHDOffer, status, rfqNumber, partNo,fileLoc) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        columns=["date", "validity", "alternate", "quantity", "unitOfMeasure", "price", "totalAmount", "discount", "discountPercentage", "offerFrieghtChargers", "offerFrieghtChargersPercentage", "offerFinalPrice", "offerUnitPriceWithFreight", "deliveryDateAsPerLHDOffer", "status", "rfqNumber", "partNo","fileLoc"]
        query="update offer set "
        for i in columns:
            if i=="fileLoc":
                query=query+i+"=%s "
            else:
                query=query+i+"=%s,"
        query=query+"where offerNumber=%s"
        ##print(query)
        values=(data["date"],data["validityDate"],alternate,qty,result0[1],data["unitPrice"],totalPrice,discount,data["offerDiscount"],offerFreightCharges,data["offerFreightCharges"],finalPrice,offerFrieghtChargersWithUnitPrice,str(data["validityDate"]),"Not Recieved",data["rfqNo"],data["partNo"],code,data["offerNo"])
        cursor.execute(query,values)
        db.commit()
        query3="update itemstatus set status=%s where partNo=%s and rfqNo=%s"
        cursor.execute(query3,("Recieved",result0[0],data["rfqNo"]))
        db.commit()
        query3="update itemstatus set status=%s where partNo=%s and rfqNo=%s"
        cursor.execute(query3,("Recieved",result0[0],data["rfqNo"]))
        db.commit()
    return jsonify({"response":"success","reference":code})

@app.route("/api/aviation/amendPO/",methods=["GET","POST"])
def amendPO():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    ##print(data)
    totalAmount=0
    for i in range(len(data["quantity"])):
        ##print(data['discounts'][i])
        temp=(float(data['discounts'][i])/100)*float(data["prices"][i])
        temp2=int(data["quantity"][i])*float(data["prices"][i])
        temp3=temp2-temp
        temp4=temp3+(temp3*(float(data["frieght"][i])/100))
        totalAmount=totalAmount+temp4
        totalAmount=round(totalAmount, 2)
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    code=str(data['no'])+str(random.randint(10000, 99999))+str(currentMonth)+str(currentYear)
    query="update po set number=%s,date=%s,totalAmount=%s,customer=%s,status=%s,deliveryPeriod=%s where id=%s"
    cursor.execute(query,(data['no'],data['date'],totalAmount,data['customer'],"amended",data['delivery'],data['poId']))
    db.commit()
    count=0
    for i in data["items"]:
        if i.find(" | ")!=-1:
            i=i.replace("value","")
            query0="delete from poitems where partNo=%s and poNumber = (select poNumber from po where id=%s)"
            cursor.execute(query0,(i,data["poId"]))
            db.commit()
            pn=i.split(" | ")
            queryTemp="select nomenclature from bom where partNo=%s"
            cursor.execute(queryTemp,(pn[0],))
            resultTemp=cursor.fetchone()
            discount=(float(data['discounts'][count])/100)*float(data["prices"][count])
            discount=round(discount, 2)
            frieght=(float(data["prices"][count])-discount)*(float(data['frieght'][count])/100)
            frieght=round(frieght, 2)
            query="insert into poitems(poNumber, partNo, nomenclature, quantity, reference, price, status, discountAmount,discountPercent,frieghtCharges,frieghtPercent) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            values=(data["no"],i,resultTemp[0],data['quantity'][count],"",round(float(data['prices'][count]),2),'Not Recieved',discount,round(float(data['discounts'][count]),2),frieght,data['frieght'][count])
            cursor.execute(query,values)
            db.commit()
        else:
            query="select partNo,rfqNo,status from itemstatus where id=%s"
            cursor.execute(query,(int(i),))
            result=cursor.fetchone()
            if result:
                query="select partNo,nomenclature from bom where id=%s"
                cursor.execute(query,(result[0],))
                result2=cursor.fetchone()
                partNo=result2[0]
                if result[2]=="Recieved":
                    queryTemp="select alternate from offer where rfqNumber=%s and partNo=%s"
                    cursor.execute(queryTemp,(result[1],result2[0]))
                    resultTemp=cursor.fetchone()
                    if resultTemp[0]=="-":pass
                    else:
                        queryTemp2="select partNo from inlieusitems where id=%s"
                        cursor.execute(queryTemp2,(resultTemp[0],))
                        resultTemp2=cursor.fetchone()
                        partNo=partNo+" | "+resultTemp2[0]
                discount=(float(data['discounts'][count])/100)*float(data["prices"][count])
                discount=round(discount, 2)
                queryTemp3="select partNo from poitems where partNo like '%"+partNo+"%' and poNumber=%s"
                cursor.execute(queryTemp3,(data['no'],))
                resultTemp3=cursor.fetchone()
                if resultTemp3:
                    partNo=resultTemp3[0]
                query0="delete from poitems where partNo=%s and poNumber = (select poNumber from po where id=%s)"
                cursor.execute(query0,(partNo,data["poId"]))
                db.commit()
                frieght=(float(data["prices"][count])-discount)*(float(data['frieght'][count])/100)
                frieght=round(frieght, 2)
                query="insert into poitems(poNumber, partNo, nomenclature, quantity, reference, price, status, discountAmount,discountPercent,frieghtCharges,frieghtPercent) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                values=(data["no"],partNo,result2[1],data['quantity'][count],result[1],round(float(data['prices'][count])-discount,2),'Not Recieved',discount,round(float(data['discounts'][count]),2),frieght,data['frieght'][count])
                cursor.execute(query,values)
                db.commit()
                query="update itemstatus set status=%s,poId=%s where id=%s"
                cursor.execute(query,("PO Recieved",data['poId'],i))
                db.commit()
            count+=1
    ##print(totalAmount)
    return jsonify({"response":data,"code":code,"amount":totalAmount})

@app.route("/api/aviation/deleteRFQ/<data>",methods=["GET","POST"])
def deleteRFQ(data):
    db,cursor = database()
    query="select rEQNumber from rfq where rfqNoSG=%s"
    cursor.execute(query,(data,))
    result=cursor.fetchone()
    if result:
        queries=["INSERT INTO trashrfq SELECT * FROM rfq WHERE rEQNumber=%s",
        "INSERT INTO trashoffer SELECT * FROM offer WHERE rfqNumber = %s",
        "INSERT INTO trashitemstatus SELECT * FROM itemstatus WHERE rfqNo = %s",
        "delete from rfq where rEQNumber=%s",
        "delete from offer where rfqNumber=%s",
        "delete from itemstatus where rfqNo=%s"]
        for i in queries:
            cursor.execute(i,(result[0],))
        db.commit()
    return jsonify({"response":"success"})

@app.route("/api/aviation/getPOItems/<id>",methods=["GET","POST"])
def getPOItems(id):
    db,cursor = database()
    query="select number, date, totalAmount, customer, deliveryPeriod from po where id=%s"
    cursor.execute(query,(id,))
    result=cursor.fetchone()
    if result:
        poDetails={"id":id,"number":result[0], "date":str(result[1]), "totalAmount":result[2], "customer":result[3], "deliveryPeriod":str(result[4])}
        query2="select * from poitems where poNumber=%s"
        cursor.execute(query2,(result[0],))
        result2=cursor.fetchall()
        items=[]
        recieved=0
        notRecieved=0
        if result2:
            for row in result2:
                if row[7]=="OC Recieved":recieved+=1
                else:
                    temp={"id":row[0], "poNumber":row[1], "partNo":row[2], "nomenclature":row[3], "quantity":row[4], "reference":row[5], "price":row[6], "status":row[7], "discountPercent":row[8], "discountAmount":row[9], "frieghtCharges":row[10], "frieghtPercent":row[11],"deliveryPeriod":str(result[4])}
                    items.append(temp)
                    notRecieved+=1
        poDetails["noItems"]=str(recieved)+" Recieved"+" | "+str(notRecieved)+" Not Recieved"
        return jsonify({"items":items,"poDetails":poDetails})
    else:jsonify({"response":[]})

@app.route("/api/aviation/addoc/",methods=["GET","POST"])
def addoc():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    print(data)
    query="select id from oc where number=%s"
    cursor.execute(query,(data["ocNumber"],))
    result=cursor.fetchone()
    if result:return jsonify({"response":"exist"})
    else:
        query="select customer from po where number=%s"
        cursor.execute(query,(data["poNumber"],))
        result=cursor.fetchone()
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        code=str(data['ocNumber'])+str(random.randint(1000000, 9999999))+str(currentMonth)+str(currentYear)
        query="insert into oc(number, date, totalAmount, customer, status, fileLoc, poNumber) values(%s,%s,%s,%s,%s,%s,%s)"
        cursor.execute(query,(data['ocNumber'],data["date"],data["ocAmount"],result[0],"Not Delivered",code,data["poNumber"]))
        db.commit()
        items=data["items"]
        count=0
        for i in items["id"]:
            query0="select partNo,nomenclature from poitems where id=%s"
            cursor.execute(query0,(i,))
            result0=cursor.fetchone()
            price=round(float(items["price"][count])*float(items["qty"][count]),2)
            discountAmount=round(price*(float(items["discount"][count])/100),2)
            frieghtCharges=round((price-discountAmount)*float(items["frieght"][count]),2)
            inlieu=result0[0].split(" | ")
            try:alternate=inlieu[1]
            except:alternate="-"
            query="insert into ocitems(ocNumber, partNo, alternate, qunatity, price, discountPercent, discountAmount, frieghtPercent, frieghtCharges, status, nomenclature,date,validity,remQty) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            cursor.execute(query,(data["ocNumber"],result0[0],alternate,items["qty"][count],round(float(items["price"][count]),2),items["discount"][count],discountAmount,items["frieght"][count],frieghtCharges,"Not Delivered",result0[1],items["date"][count],items["delivery"][count],items["qty"][count]))
            db.commit()
            query2="update poitems set status='OC Recieved' where id=%s"
            cursor.execute(query2,(i,))
            db.commit()
            count+=1
        return jsonify({"respnse":"success","ocNumber":data["ocNumber"],"ocAmount":data["ocAmount"],"code":code})

@app.route("/api/aviation/getOCBOM/<id>",methods=["GET","POST"])
def getOCBOM(id):
    db,cursor = database()
    query0="select poNumber from oc where number in (select ocNumber from ocitems where id=%s)"
    cursor.execute(query0,(id,))
    result0=cursor.fetchone()
    query01="select customer from po where number=%s"
    cursor.execute(query01,(result0[0],))
    result01=cursor.fetchone()
    query="select id,partNo,nomenclature,customer,nsn from bom where customer=%s"
    cursor.execute(query,(result01[0],))
    result=cursor.fetchall()
    #print(result)
    response=[]
    if result:
        for row in result:
            temp={"id":row[0],"partNo":row[1],"nomanclature":row[2],"customer":row[3],"nsn":row[4]}
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/aviation/uploadOCDocument/<code>",methods=["GET","POST"])
def uploadOCDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update oc set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/aviation/getOCItemDetail/<id>",methods=["GET","POST"])
def getOCItemDetail(id):
    db,cursor = database()
    query="select * from ocitems where id=%s"
    cursor.execute(query,(id,))
    result=cursor.fetchone()
    if result:
        response={"id":result[0], "ocNumber":result[1], "partNo":result[2], "alternate":result[3], "qunatity":result[4], "price":result[5], "discountPercent":result[6], "discountAmount":result[7], "frieghtPercent":result[8], "frieghtCharges":result[9], "status":result[10], "nomenclature":result[11],"date":str(result[12]),"validity":str(result[13])}
        query2="select poNumber from oc where number=%s"
        cursor.execute(query2,(result[1],))
        result2=cursor.fetchone()
        response["poNumber"]=result2[0]
    return jsonify({"response":response})

@app.route("/api/aviation/editOrderConfirmation/",methods=["GET","POST"])
def editOrderConfirmation():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    print(data)
    currentMonth = datetime.now().month
    currentYear = datetime.now().year
    price=round(float(data["unitPrice"])*float(data["qty"]),2)
    discountAmount=round(((float(data["ocDiscount"])/100)*price)*float(data["qty"]),2)
    frieghtCharges=round(float(price-discountAmount)*(float(data["ocFrieghtCharges"])/100),2)
    code=str(data["id"])+str(random.randint(100000000, 999999999))+str(currentMonth)+str(currentYear)
    query="update ocitems set alternate=%s, qunatity=%s, price=%s, discountPercent=%s, discountAmount=%s, frieghtPercent=%s, frieghtCharges=%s, status=%s, fileLoc=%s where id=%s"
    cursor.execute(query,(data["alternate"],data["qty"],round(float(data["unitPrice"]),2),data["ocDiscount"],discountAmount,data["ocFrieghtCharges"],frieghtCharges,"Not Delivered", code, data["id"]))
    db.commit()
    query2="select qunatity, price, discountPercent, discountAmount, frieghtPercent, frieghtCharges from ocitems where ocNumber in (select ocNumber from ocitems where id=%s)"
    cursor.execute(query2,(data["id"],))
    result2=cursor.fetchall()
    total=0
    if result2:
        for row in result2:
            price=round(float(row[1])*float(row[0]),2)
            discountAmount=round((float(row[2])/100)*price,2)
            frieghtCharges=round(float(price-discountAmount)*(float(row[4])/100),2)
            temp=(price-discountAmount)+frieghtCharges
            total=total+temp
    query3="update oc set totalAmount=%s where number in (select ocNumber from ocitems where id=%s)"
    cursor.execute(query3,(total,data["id"]))
    db.commit()
    return jsonify({"response":"success","code":code})

@app.route("/api/aviation/uploadOCEditDocument/<code>",methods=["GET","POST"])
def uploadOCEditDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    #file.save(os.path.join("/root/var/www/ajcl/aviationSystem/documents/", secure_filename(str(code)+format)))
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update ocitems set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/aviation/getPOAllOCItems/<search>",methods=["GET","POST"])
def getPOAllOCItems(search):
    db,cursor = database()
    query="select id, ocNumber, partNo, alternate, remQty, price, discountPercent, frieghtPercent, status, nomenclature, date, validity from ocitems where remQty!=0 and ocNumber in (select number from oc where poNumber=%s)"
    cursor.execute(query,(search,))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            temp={"id":row[0], "ocNumber":row[1], "partNo":row[2], "alternate":row[3], "qunatity":row[4], "price":row[5], "discountPercent":row[6], "frieghtPercent":row[7], "status":row[8], "nomenclature":row[9], "date":str(row[10]), "validity":str(row[11])}
            query2="select poNumber from oc where number=%s"
            cursor.execute(query2,(row[1],))
            result2=cursor.fetchone()
            temp["poNumber"]=result2[0]
            response.append(temp)
        return jsonify({"response":response})
    else:
        return jsonify({"response":"not found"})

@app.route("/api/aviation/addPKL/",methods=["GET","POST"])
def addPKL():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    query="select id from pl where number=%s"
    cursor.execute(query,(data["pklNumber"],))
    result=cursor.fetchone()
    if result:
        return jsonify({"response":"exist"})
    else:
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        code=str(data["pklNumber"])+"PKL"+str(random.randint(1000, 9999))+str(currentMonth)+str(currentYear)
        query="insert into pl(number, date, shipmentDate, AWB, fileLoc,status) values(%s,%s,%s,%s,%s,%s)"
        cursor.execute(query,(data["pklNumber"],data["date"],data["shipmentDate"],"",code,"-"))
        db.commit()
        poNumber=[]
        sn=data["sn"]
        qty=data["qty"]
        count=0
        for i in data["items"]:
            query2="select poNumber,number from oc where number in (select ocNumber from ocitems where id=%s)"
            cursor.execute(query2,(i,))
            result2=cursor.fetchone()
            query3="select partNo,nomenclature,qunatity,price,discountPercent,frieghtPercent,ocNumber,remQty,alternate from ocitems where id=%s"
            cursor.execute(query3,(i,))
            result3=cursor.fetchone()
            remainingQty=int(result3[7])-int(qty[count])
            query4="insert into plitems(serialNumber, partNumber, nomenclature, qtyRem, qtyPro, qtyDel, price, discount, frieght, plNumber, reference, damage,missing,comment, status,inlieu) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            cursor.execute(query4,(sn[count],result3[0],result3[1],remainingQty,qty[count],0,result3[3],result3[4],result3[5],data["pklNumber"],result2[1],0,0,"-","In Process",result3[8]))
            query5="update ocitems set status=%s where id=%s"
            cursor.execute(query5,('In Queue',i))
            db.commit()
            query6="update ocitems set remQty=%s where id=%s"
            cursor.execute(query6,(remainingQty,i))
            db.commit()
            poNumber.append(result2[0])
            count+=1
        pos=list(dict.fromkeys(poNumber))
        return jsonify({"response":"success","pklNumber":data["pklNumber"],"pos":pos,"code":code})

@app.route("/api/aviation/uploadPKLDocument/<code>",methods=["GET","POST"])
def uploadPKLDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update pl set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/getAllPKL/",methods=["GET","POST"])
def getAllPKL():
    db,cursor = database()
    query="select * from pl order by id desc"
    cursor.execute(query)
    result=cursor.fetchall()
    pl=[]
    if result:
        for row in result:
            temp={"id":row[0], "number":row[1], "date":str(row[2]), "shipmentDate":str(row[3]), "AWB":row[4], "fileLoc":row[5]}
            query2="select * from plitems where plNumber=%s"
            cursor.execute(query2,(row[1],))
            result2=cursor.fetchall()
            if result2:
                item=[]
                tempInvoice=False
                for row2 in result2:
                    temp2={"id":row2[0], "serialNumber":row2[1], "partNumber":row2[2], "nomenclature":row2[3], "qtyRem":row2[4], "qtyPro":row2[5], "qtyDel":row2[6], "price":row2[7], "discount":row2[8], "frieght":row2[9], "plNumber":row2[10], "reference":row2[11], "status":row2[12],"damage":int(row2[13]),"missing":int(row2[14]),"comment":row2[15]}
                    if str(row2[12])=="In Process":
                        temp["invoiceNumber"]="-"
                        temp["CRV"]="-"
                    else:
                        if tempInvoice:pass
                        else:
                            tempInvoice=True
                            query3="select invoiceNumber from invoiceitems where refference=%s"
                            cursor.execute(query3,(row[1],))
                            result4=cursor.fetchone()
                            if result4:
                                temp["invoiceNumber"]=result4[0]
                                query4="select crvNumber from crvitems where refference=%s"
                                cursor.execute(query4,(result4[0],))
                                result5=cursor.fetchone()
                                if result5:temp["CRV"]=result5[0]
                                else:temp["CRV"]="-"
                    item.append(temp2)
                temp["items"]=item
            pl.append(temp)
    return jsonify({"response":pl})

@app.route("/api/getAllPKLNamess/",methods=["GET","POST"])
def getAllPKLNames():
    db,cursor = database()
    query="select number from pl where status=%s"
    cursor.execute(query,("-",))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            response.append(row[0])
    return jsonify({"response":response})

@app.route("/api/getPKLItems/<search>",methods=["GET","POST"])
def getPKLItems(search):
    db,cursor = database()
    query="select id, serialNumber, partNumber, nomenclature, qtyRem, qtyPro, qtyDel, price, discount, frieght, plNumber, reference, status, damage, missing, comment from plitems where plNumber=%s"
    cursor.execute(query,(search,))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            temp={"id":row[0], "serialNumber":row[1], "partNumber":row[2], "nomenclature":row[3], "qtyRem":row[4], "qtyPro":row[5], "qtyDel":row[6], "price":row[7], "discount":row[8], "frieght":row[9], "plNumber":row[10], "reference":row[11], "status":row[12], "damage":row[13], "missing":row[14], "comment":row[15]}
            query2="select price,discountPercent,frieghtPercent from ocitems where partNo=%s and ocNumber=%s"
            cursor.execute(query2,(temp["partNumber"],temp["reference"]))
            result2=cursor.fetchone()
            temp["price"]=result2[0]
            temp["discountPercent"]=result2[1]
            temp["frieghtPercent"]=result2[2]
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/aviation/addInvoice/",methods=["GET","POST"])
def addInvoice():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    query="select id from invoice where number=%s"
    cursor.execute(query,(data["invoiceNumber"],))
    result=cursor.fetchone()
    if result:
        return jsonify({"response":"exist"})
    else:
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        code=str(data["invoiceNumber"])+"INV"+str(random.randint(100000, 999999))+str(currentMonth)+str(currentYear)
        query="insert into invoice(number, projectNumber, date,fileLoc) values(%s,%s,%s,%s)"
        cursor.execute(query,(data["invoiceNumber"],data["pjtNumber"],data["invoiceDate"],code))
        db.commit()
        items=data["items"]
        prices=data["prices"]
        discounts=data["discounts"]
        frieghts=data["frieghts"]
        count=0
        for i in items:
            query2="select plNumber,serialNumber,partNumber,nomenclature,qtyPro,inlieu from plitems where id=%s"
            cursor.execute(query2,(i,))
            result2=cursor.fetchone()
            if result2:
                query3="insert into invoiceitems(invoiceNumber, sn, partNumber, nomenclature, inlieu, qty, price, discount, frieght, refference) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                cursor.execute(query3,(data["invoiceNumber"],result2[1],result2[2],result2[3],result2[5],result2[4],prices[count],discounts[count],frieghts[count],result2[0]))
                db.commit()
                query4="update plitems set status=%s where id=%s"
                cursor.execute(query4,("dispatch",i))
                db.commit()
                query5="update pl set status=%s where number=%s"
                cursor.execute(query5,("dispatch",result2[0]))
                db.commit()
            count+=1
        return jsonify({"response":"success","code":code,"invoiceNumber":data["invoiceNumber"],"pjtNumber":data["pjtNumber"]})

@app.route("/api/aviation/uploadInvoiceDocument/<code>",methods=["GET","POST"])
def uploadInvoiceDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update invoice set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/aviation/getAllPKLNamesAWB/",methods=["GET","POST"])
def getAllPKLNamesAWB():
    db,cursor = database()
    query="select number from pl where status=%s"
    cursor.execute(query,('dispatch',))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            response.append(row[0])
    return jsonify({"response":response})

@app.route("/api/aviation/addAWB/",methods=["GET","POST"])
def addAWB():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    query="select id from awb where number=%s"
    cursor.execute(query,(data["awbNumber"],))
    result=cursor.fetchone()
    if result:
        return jsonify({"response":"exist"})
    else:
        items=data["items"]
        pls=','.join(items)
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        code=str(data["awbNumber"])+"AWB"+str(random.randint(100000, 999999))+str(currentMonth)+str(currentYear)
        query2="insert into awb(number, date, pls, fileLoc) values(%s,%s,%s,%s)"
        cursor.execute(query2,(data["awbNumber"],data["awbDate"],pls,code))
        db.commit()
        for i in data["items"]:
            query3="update pl set awb=%s,status=%s where number=%s"
            cursor.execute(query3,(data["awbNumber"],'dispatched',i))
            db.commit()
            query4="update plitems set status='dispatched' where plnumber=%s"
            cursor.execute(query4,(i,))
            db.commit()
        return jsonify({"response":"success","code":code,"awbNumber":data["awbNumber"]})

@app.route("/api/aviation/uploadAWBDocument/<code>",methods=["GET","POST"])
def uploadAWBDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update awb set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/aviation/getAllInvoiceNames/",methods=["GET","POST"])
def getAllInvoiceNames():
    db,cursor = database()
    query="select number from invoice where number not in (select refference from crvitems)"
    cursor.execute(query)
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            response.append(row[0])
    return jsonify({"response":response})

@app.route("/api/aviation/getInvoiceItems/<search>",methods=["GET","POST"])
def getVoiceItems(search):
    db,cursor = database()
    query="select id, invoiceNumber, sn, partNumber, nomenclature, inlieu, qty, refference from invoiceitems where invoiceNumber=%s"
    cursor.execute(query,(search,))
    result=cursor.fetchall()
    response=[]
    if result:
        for row in result:
            temp={"id":row[0], "invoiceNumber":row[1],"sn":row[2], "partNumber":row[3], "nomenclature":row[4], "inlieu":row[5], "qty":row[6],"poNumber":row[7]}
            response.append(temp)
    return jsonify({"response":response})

@app.route("/api/aviation/addCRV/",methods=["GET","POST"])
def addCRV():
    db,cursor = database()
    data=request.get_data().decode()
    data = json.loads(data)
    query="select id from crv where number=%s"
    cursor.execute(query,(data["crvNumber"],))
    result=cursor.fetchone()
    if result:
        return jsonify({"response":"exist"})
    else:
        query2="insert into crv(number,date,fileLoc) values(%s,%s,%s)"
        currentMonth = datetime.now().month
        currentYear = datetime.now().year
        code=str(data["crvNumber"])+"CRV"+str(random.randint(100000, 999999))+str(currentMonth)+str(currentYear)
        cursor.execute(query2,(data["crvNumber"],data["crvDate"],code))
        db.commit()
        damage=data["damage"]
        missing=data["missing"]
        comment=data["comment"]
        print(damage)
        count=0
        previous=""
        for i in data["items"]:
            query3="insert into crvitems(serialNumber, partNumber, nomenclature, inlieu, qty, crvNumber, damageQuantity, missingQuantity, comment, refference) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            query4="select invoiceNumber, sn, partNumber, nomenclature, inlieu, qty, refference from invoiceitems where id=%s"
            cursor.execute(query4,(i,))
            result4=cursor.fetchone()
            cursor.execute(query3,(result4[1],result4[2],result4[3],result4[4],result4[5],data["crvNumber"],damage[count],missing[count],comment[count],result4[0]))
            db.commit()
            query5="update plitems set status='delivered',damage=%s,missing=%s,comment=%s where plNumber=%s and partNumber=%s"
            cursor.execute(query5,(damage[count],missing[count],comment[count],result4[6],result4[2]))
            db.commit()
            count+=1
        return jsonify({"response":"success","crvNumber":data["crvNumber"],"code":code})

@app.route("/api/aviation/uploadCRVDocument/<code>",methods=["GET","POST"])
def uploadCRVDocument(code):
    db,cursor = database()
    file=request.files["attachDoc"]
    fileName=file.filename
    temp=fileName.split(".")
    format=temp[1]
    file.save(os.path.join("D:\docsTemp", secure_filename(str(code)+"."+format)))
    query="update crv set fileLoc=%s where fileLoc=%s"
    cursor.execute(query,(str(code)+"."+format,str(code)))
    db.commit()
    return redirect("https://google.com")

@app.route("/api/searchPKL/<search>",methods=["GET","POST"])
def searchPKL(search):
    db,cursor = database()
    query="select * from pl where number like '%"+search+"%' or AWB like '%"+search+"%' order by id desc"
    cursor.execute(query)
    result=cursor.fetchall()
    pl=[]
    if result:
        for row in result:
            temp={"id":row[0], "number":row[1], "date":str(row[2]), "shipmentDate":str(row[3]), "AWB":row[4], "fileLoc":row[5]}
            query2="select * from plitems where plNumber=%s"
            cursor.execute(query2,(row[1],))
            result2=cursor.fetchall()
            if result2:
                item=[]
                tempInvoice=False
                for row2 in result2:
                    temp2={"id":row2[0], "serialNumber":row2[1], "partNumber":row2[2], "nomenclature":row2[3], "qtyRem":row2[4], "qtyPro":row2[5], "qtyDel":row2[6], "price":row2[7], "discount":row2[8], "frieght":row2[9], "plNumber":row2[10], "reference":row2[11], "status":row2[12],"damage":int(row2[13]),"missing":int(row2[14]),"comment":row2[15]}
                    if str(row2[12])=="In Process":
                        temp["invoiceNumber"]="-"
                        temp["CRV"]="-"
                    else:
                        if tempInvoice:pass
                        else:
                            tempInvoice=True
                            query3="select invoiceNumber from invoiceitems where refference=%s"
                            cursor.execute(query3,(row[1],))
                            result4=cursor.fetchone()
                            if result4:
                                temp["invoiceNumber"]=result4[0]
                                query4="select crvNumber from crvitems where refference=%s"
                                cursor.execute(query4,(result4[0],))
                                result5=cursor.fetchone()
                                if result5:temp["CRV"]=result5[0]
                                else:temp["CRV"]="-"
                    item.append(temp2)
                temp["items"]=item
            pl.append(temp)
    return jsonify({"response":pl})

@app.route("/api/getInvoiceDetails/<number>",methods=["GET","POST"])
def getInvoiceDetails(number):
    db,cursor = database()
    query="select * from invoice where number=%s"
    cursor.execute(query,(number,))
    result=cursor.fetchone()
    invoice={}
    if result:
        fileLoc="D:/docsTemp/"+str(result[4])
        invoice={"id":result[0], "number":result[1], "projectNumber":result[2], "date":str(result[3]), "fileLoc":fileLoc}
    query2="select * from invoiceitems where invoiceNumber=%s"
    cursor.execute(query2,(number,))
    result2=cursor.fetchall()
    items=[]
    if result2:
        for row in result2:
            temp={"id":row[0], "invoiceNumber":row[1], "sn":row[2], "partNumber":row[3], "nomenclature":row[4], "inlieu":row[5], "qty":row[6], "price":row[7], "discount":row[8], "frieght":row[9], "refference":row[10]}
            items.append(temp)    
    return jsonify({"invoice":invoice,"items":items})

@app.route("/api/getCRVDetails/<number>",methods=["GET","POST"])
def getCRVDetails(number):
    db,cursor = database()
    query="select * from crv where number=%s"
    cursor.execute(query,(number,))
    result=cursor.fetchone()
    crv={}
    if result:
        fileLoc="D:/docsTemp/"+str(result[3])
        crv={"id":result[0], "number":result[1], "date":str(result[2]), "fileLoc":fileLoc}
    query2="select * from crvitems where crvNumber=%s"
    cursor.execute(query2,(number,))
    result2=cursor.fetchall()
    items=[]
    if result2:
        for row in result2:
            temp={"id":row[0], "serialNumber":row[1], "partNumber":row[2], "nomenclature":row[3], "inlieu":row[4], "qty":row[5], "crvNumber":row[6], "damageQuantity":row[7], "missingQuantity":row[8], "comment":row[9], "refference":row[10]}
            items.append(temp)
    return jsonify({"crv":crv,"items":items})

if __name__=="__main__":
    app.run(port=7700,debug=True)
