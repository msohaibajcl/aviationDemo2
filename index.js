url="http://127.0.0.1:7700"
function login(){
    // console.log("access")
    email=document.getElementById("email").value;
    password=document.getElementById("password").value;
    authCode=document.getElementById("authCode").value;
    if(email==""){
        document.getElementById("email").style.borderColor="red";
    }
    else if(password==""){
        document.getElementById("password").style.borderColor="red";
    }
    else if(authCode==""){
        document.getElementById("authCode").style.borderColor="red";
    }
    else{
        document.getElementById("email").style.borderColor="grey";
        document.getElementById("password").style.borderColor="grey";
        document.getElementById("authCode").style.borderColor="grey";
        data={"email":email,"password":password,"authCode":authCode};
        postData=JSON.stringify(data);
        request=url+'/api/aviation/login/';
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
            data:postData,
            success: function(data){
                if(data["response"]=="success"){
                    document.getElementById("error").style.display="none";
                    document.getElementById("error").innerHTML="";
                    localStorage.setItem("email",email);
                    localStorage.setItem("department",data["department"]);
                    window.location.href="employeeDashboard.html";
                }
                else{
                    document.getElementById("error").style.display="block"
                    document.getElementById("error").innerHTML=data["response"]
                }
            }
        });
    }
}
function dashboard(){
    // console.log("access");
    document.getElementById("department").innerHTML=localStorage.getItem("department").toUpperCase();
    const email=localStorage.getItem("email");
    let name=email.split("@");
    document.getElementById("user-name").innerHTML=name[0];
    let width = screen.width;
    if(width<=1600){
        let options=document.getElementById("menubar").innerHTML;
        document.getElementById("menubar").innerHTML="<button onclick='showMenubar()' style='box-shadow: none;border: none;'><img src='images/bars-solid.svg' height='30px'></button>";
        document.getElementById("menubarResponsive").innerHTML=options;
        document.getElementById("menubarResponsive").style.display="none";
        // document.getElementsByClassName("menubar").style.width="100%";
        document.getElementById("customer").style.display="none";
    }else{}
        request=url+'/api/aviation/getUserInfo/'+localStorage.getItem("email");
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            success: function(data){
                document.getElementById("name").innerHTML="Name: "+data["response"]["name"]
                document.getElementById("email").innerHTML="Email: "+data["response"]["email"]
                document.getElementById("profileDepartment").innerHTML="Department: "+data["response"]["department"]
                document.getElementById("post").innerHTML="Post: "+data["response"]["post"]
                document.getElementById("age").innerHTML="Age: "+data["response"]["age"]
                document.getElementById("loc").innerHTML="Location: "+data["response"]["loc"]
            }
        });
}
function showMenubar(){
    if(document.getElementById("menubarResponsive").style.display=="none"){
        document.getElementById("menubarResponsive").style.display="block";
    }
    else{
        document.getElementById("menubarResponsive").style.display="none";
    }
}
function dashboardFilter(){
    // console.log(document.getElementById("dashboardFilter").value);
    if(document.getElementById("dashboardFilter").value=="all"){
        document.getElementById("customer").innerHTML="<img class='customerLogo' src='images/pakArmy.png'><img class='customerLogo' src='images/pakNavy.png'><img class='customerLogo' src='images/pakCD.png'>";
    }
    else if(document.getElementById("dashboardFilter").value=="pakArmy"){
        document.getElementById("customer").innerHTML="<img class='customerLogo' src='images/pakArmy.png'>";
    }
    else if(document.getElementById("dashboardFilter").value=="pakNavy"){
        document.getElementById("customer").innerHTML="<img class='customerLogo' src='images/pakNavy.png'>'";
    }
    else if(document.getElementById("dashboardFilter").value=="dgp"){
        document.getElementById("customer").innerHTML="<img class='customerLogo' src='images/pakArmy.png'>";
    }
    else if(document.getElementById("dashboardFilter").value=="cd"){
        document.getElementById("customer").innerHTML="<img class='customerLogo' src='images/pakCD.png'>";
    }
    else{}
}
function RFQs(){
    // console.log("access");
    document.getElementById("department").innerHTML=localStorage.getItem("department").toUpperCase();
    const email=localStorage.getItem("email");
    let name=email.split("@");
    document.getElementById("user-name").innerHTML=name[0];
    let width = screen.width;
    if(width<=1600){
        let options=document.getElementById("menubar").innerHTML;
        document.getElementById("menubar").innerHTML="<button onclick='showMenubar()' style='box-shadow: none;border: none;'><img src='images/bars-solid.svg' height='30px'></button>";
        document.getElementById("menubarResponsive").innerHTML=options;
        document.getElementById("menubarResponsive").style.display="none";
        // document.getElementsByClassName("menubar").style.width="100%";
        document.getElementById("customer").style.display="none";
    }else{}
    loadRFQs()
}   
function getSelectedItems(){
    try{
        temp01=localStorage.getItem("itemList");
        temp02=JSON.parse(temp01);
        temp03=temp02.items;
        item="";
        qty="";
        nsn="";
        stat=true;
        temp03.forEach(element => {
            var temp=document.getElementById("pn"+String(element)).innerHTML;
            var temp2=document.getElementById("qty"+String(element)).value;
            var temp3=document.getElementById("nsn"+String(element)).value;
            if(temp=="0" || temp2==""){stat=false;}
            else{}
            if(item!=""){item=item+","+temp;qty=qty+","+temp2;nsn=nsn+","+temp3}
            else{item=temp;qty=temp2;nsn=temp3}
        });
        if(stat){  
            document.getElementById("partNo").value=item;
            document.getElementById("qty").value=qty;
            document.getElementById("nsn").value=nsn;
            return stat;
        }
        else{
            document.getElementById("partNo").value="";
            document.getElementById("qty").value="";
            return stat;
        }
    }
    catch(e){
        // localStorage.setItem("itemList",JSON.stringify({"items":[1]}))
        // localStorage.setItem("itemQuantity",1)
        // temp01=localStorage.getItem("itemList")
        // temp02=JSON.parse(temp01)
        // temp03=temp02.items
        return false
    }
}
function addRFQ(){
    // console.log("access");
    result=getSelectedItems();
    console.log(result);
    console.log(document.getElementById("partNo").value);
    console.log(document.getElementById("qty").value);
    // console.log(result)
    if(result){
    ids=["rfqNo","rfqCategory","rfqType","reqDate","deliveryDate","partNo","qty","customer","nsn"];
    const errors=[];
    start=document.getElementById("reqDate").value;
    end=document.getElementById("deliveryDate").value;
    if(Date.parse(start)>=Date.parse(end)){
        errors.push("deliveryDate");
    }
    else{}
    ids.forEach(element => {
        // console.log(element)
        var temp=document.getElementById(element).value;
        // console.log(temp)
        if(element=="rfqType"){
            if(temp=="select"){
                errors.push(element)
            }
            // else if(temp=="ro" && document.getElementById("serialNo").value==""){
            //     errors.push("serialNo")
            // }
            else{}
        }
        else if(temp && temp!="select"){
            document.getElementById(element).style.borderColor="grey";
        }
        else if(element=="qty"){
            temp01=localStorage.getItem("itemList");
            temporary=temp.split(",");
            console.log(temporary);
            temporary.forEach(k => {
                if(k==""){errors.push("qty"+element);}
                else{}
            }); 
        }
        else{
            // console.log("123acess")
            errors.push(element)
        }
    });
    // console.log(errors)
    if (errors.length == 0){
        sendData={}
        count=0
        ids.forEach(element => {
            sendData[element]=document.getElementById(element).value;
        }); 
        // console.log(sendData);
        var fd = new FormData();
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
            sendData=JSON.stringify(sendData);
            request=url+'/api/aviation/addRFQ/';
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
                data:sendData,
                success: function(data){ 
                    if(data["response"]=="exist"){
                        alert("RFQ Already Exist!");
                        document.getElementById("rfqNo").style.borderColor="red";
                    }
                    else{
                        document.getElementById("formBody").style.filter="blur(5px)";
                        document.getElementById("ignismyModal").style.display="block";
                        document.getElementById("ignismyModal").style.opacity="1";
                        document.getElementById("sgrfq").innerHTML=data["code"];
                        document.getElementById("customerRFQ").innerHTML=document.getElementById("rfqNo").value;
                        document.getElementById("rfqDocForm").action=url+"/api/aviation/uploadRFQDocument/"+data["code"];
                    }
                }
            });
        }else{alert("Please Select File!")}
    }
    else{
        // console.log(errors)
        errors.forEach(element => {
            document.getElementById(element).style.borderColor="red";
        });
        return false
    }
    }
    else{
        // console.log("else")
        document.getElementById("partNos").style.background="#b900002e";
        document.getElementById("partNos").style.borderColor="red";
        return false
    }
}
function submitRFQDocument(){
    document.getElementById("rfqDocForm").submit();
}
function rfqItemFilter(){
    
}
function loadAddRFQForm(){
    localStorage.removeItem("itemQuantity");
    localStorage.removeItem("itemList");
    if(document.getElementById("customer").value!="select"){
    document.getElementById("allItems").innerHTML="";
    document.getElementById("loader").style.display="block";
    request=url+'/api/aviation/getBOM/'+document.getElementById("customer").value;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            localStorage.setItem("bom",JSON.stringify(data["response"]));
            // console.log(data);
            //var $pn=$("#pn1");
            var $items=$("#allItems");
            $.each(data, function(i,item) {
                $.each(this, function(i, item){
                //    $pn.append("<option value='"+item.id+"'>"+item.partNo+" | "+item.nomanclature+"</option>");
                    $items.append("<option onclick='addItemInRFQ()' value='"+item.partNo+"'>"+item.nomanclature+" | "+item.nsn+"</option>");
                });
            });
            document.getElementById("loader").style.display="none";
        }
    });}else{}
    // console.log("abc");
}
function addItemInRFQHtml(id,partNo,data){
    nomenclature="";nsn="";
    // console.log(data);
    $.each(data, function(i, item){
        if(item.slice(-1)=="}"){}
        else{item=item+'}'}
        temp=JSON.parse(item)
        // console.log(String(temp.partNo)+"=="+String(partNo))
        if(String(temp.partNo)==String(partNo)){
            nomenclature=temp.nomanclature;
            nsn=temp.nsn;
        }
        else{}
    });
    var html='<div><p id="pn'+id+'">'+partNo+'</p></div>'+
    '<div><p id="nom'+id+'">'+nomenclature+'</p></div>'+
    '<div><input id="nsn'+id+'" value="'+nsn+'"></div>'+
    '<div><input id="qty'+id+'" placeholder="Enter Quantity"></div>'+
    '<div><img src="images/xmark-solid.svg" id="remove'+id+'" onclick="removeItemFromRFQ(this)" /></div>'
  return html
}
// function rfqType(){
//     temp=document.getElementById("rfqType").value;
//     if(temp=="ro"){
//         document.getElementById("quantity").innerHTML="Serial No";
//     }
//     else{
//         document.getElementById("quantity").innerHTML="Quantity";
//     }
// }
function addItemInRFQ(partNo){
    tryVar=false
    var $pn="";
    data=localStorage.getItem("bom");
    data=data.replace("[","");
    data=data.replace("]","");
    data=data.split("},");
    try{
        temp=localStorage.getItem("itemQuantity");
        temp2=localStorage.getItem("itemList");
        localStorage.setItem("itemQuantity",parseInt(temp)+1)
        temp3=JSON.parse(temp2)
        temp4=temp3.items
        tempStatus=false
        $.each(temp4,function(i,listItem){
            console.log(partNo);
            if(partNo==document.getElementById("pn"+listItem).innerHTML){
                tempStatus=true;
                return false
            }else{}
        });
        if(tempStatus){alert("Item Already Selected!");}
        else{
        temp4.push(parseInt(temp)+1)
        localStorage.setItem("itemList",JSON.stringify({"items":temp4}))
        html=addItemInRFQHtml(String(parseInt(temp)+1),partNo,data);
        $("#partNos").append(html);
        tryVar=true
        $pn=$("#pn"+String(parseInt(temp)+1));
        }
        // console.log("try");
    }
    catch(e){
        if(tryVar){}
        else{
        localStorage.setItem("itemQuantity",1);
        localStorage.setItem("itemList",JSON.stringify({"items":[1]}));
        dataId=$("#searchItem").find(':selected').attr('data-id');
        html=addItemInRFQHtml(1,partNo,data);
        $("#partNos").append(html);
        $pn=$("#pn2")
        // console.log("catch")
    }}
    // $pn=$("#pn2");
    // console.log(data);
    // $.each(data, function(i, item){
    //     if(item.slice(-1)=="}"){}
    //     else{item=item+'}'}
    //     temp=JSON.parse(item)
    //     $pn.append("<option value='"+temp.id+"'>"+temp.partNo+" | "+temp.nomanclature+"</option>")
    // });
    console.log(localStorage.getItem("itemQuantity"));
    console.log(localStorage.getItem("itemList"));
    document.getElementById("searchItem").value="";
    return false
}
function removeItemFromRFQ(param){
    id=String(param.id);
    temp=localStorage.getItem("itemList");
    temp2=JSON.parse(temp)
    temp3=temp2.items
    temp4=localStorage.getItem("itemQuantity");
    temp4=parseInt(temp4)
    // console.log(id)
    find=""
    if(temp4 < 10){find=id.slice(-1)}
    else if(temp4 >= 10 && temp4 < 100){find=id.slice(-2)}
    else if(temp4 >= 100){find=id.slice(-3)}
    else if(temp4 >= 1000){find=id.slice(-4)}
    else{}
    find=find.replace("n","")
    find=find.replace("n","")
    // console.log(find);
    const index = temp3.indexOf(parseInt(find));
    if (index > -1) { // only splice array when item is found
        temp3.splice(index, 1); // 2nd parameter means remove one item only
    }
    // console.log(temp3);
    localStorage.setItem("itemList",JSON.stringify({"items":temp3}))
    find = find.replace(/\D/g,'');
    console.log(find)
    // console.log(localStorage.getItem("itemList"));
    const element = document.getElementById('pn'+find);
    element.remove();
    const element2 = document.getElementById('qty'+find);
    element2.remove();
    const element3 = document.getElementById('remove'+find);
    element3.remove();
    const element4 = document.getElementById('nom'+find);
    element4.remove();
    const element5 = document.getElementById('nsn'+find);
    element5.remove();
}
function addBomItem(){
    ids=["partNo","nomenclature","uom","alternate","unitPrice","currency","company"]
    errors=[]
    itemStatus=false
    $.each(ids, function(i, item){
        temp=document.getElementById(item).value;
        if(temp && temp!="select"){
            document.getElementById(item).style.borderColor="grey";
        }
        else{
            itemStatus=true
            errors.push(item)
        }
    });
    if(itemStatus){
        // console.log(itemStatus);
        $.each(errors, function(i, item){
            document.getElementById(item).style.borderColor="red";
        });
    }
    else{
        data={}
        $.each(ids, function(i, item){
            data[item]=document.getElementById(item).value;
        });
        postData=JSON.stringify(data);
        console.log(postData)
        request=url+'/api/aviation/addItemToBOM/';
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                if(data["response"]=="exist"){
                    alert("Item Already Exist!")
                    document.getElementById("partNo").style.borderColor="red";
                }
                else{
                    alert("Item Added Successfully!");
                    history.back();
                }

            }
        });
    }
}
function rfqItemHTML(rfqNo,item,offerNo,offer,type,id,sti){ 
    console.log(id)
    bg='white'
    revise='<div class="reviseOffer" id="revise'+offer[offerNo]["id"]+'" onclick="reviseOffer(this)">Revise</div>'
    if(item[2]=='PO Recieved'){
        bg='#00800078';
        revise="<div class='lockedOffer'>Locked</div>";
    }
    else if(item[2]=='Not Recieved'){
        bg='#ff000045';
    }
    else if(item[2]=="Recieved"){
        bg="#89560a9e";
    }else{}
    offerHTML=""
    if(offer[offerNo]=="Not Recieved"){
        if(item[2]=='PO Recieved'){
            offerHTML="<div></div>"
        }
        else{
        offerHTML="<div><button id='"+rfqNo+"|"+item[0]+"|"+type+"|"+sti+"' class='addOfferButton' onclick='addOffer(this)'>Enter Offer</button></div>"
        }
    }  
    else{
        offerHTML='<div class="offerDetails"><div><button onclick="enableOfferModal(this)" id="offer'+offer[offerNo]["id"]+'">'+offer[offerNo]["offerNumber"]+'</button></div>'+
            '<div>'+offer[offerNo]["unitOfMeasure"]+'</div>'+
            '<div>'+offer[offerNo]["quantity"]+'</div>'+
            '<div>'+offer[offerNo]["price"]+'</div>'+
            revise+
            '</div>'
    }
    html='<tr class="offerDetailsRow">'+
        '<td>'+item[0]+'</td>'+
            '<td>'+item[1]+'</td>'+
            '<td>'+item[3]+'</td>'+
            '<td>'+
                '<div class="offerDetailsSection">'+
                    offerHTML+
                        // '<div>111</div>'+
                        // '<div>CM</div>'+
                        // '<div>5</div>'+
                        // '<div>$999</div>'+
            '  </div>'+
            ' </td>'+
            ' <td style="background:'+bg+'">'+item[2]+'</td>'+
        '</tr>'
    return html
}
function rfqHTML(data,items,offerNo,offer){
    itemsHTML=""
    globalRFQStatus=""
    globalPOStatus=""
    $.each(items, function(i, item){
        console.log(offer);
        itemsHTML=itemsHTML+rfqItemHTML(data.rEQNumber,item,offerNo[i],offer,data.rEQType,item.id,data.rfqNoSG);
        if(item[2]=='PO Recieved'){
            if(globalPOStatus=="PO Recieved" || globalPOStatus==""){globalPOStatus="PO Recieved"}
            else{globalPOStatus="PO Partially Recieved"}
            if(globalRFQStatus=="Offer Recieved" || globalRFQStatus==""){globalRFQStatus="Offer Recieved"}
            else{globalRFQStatus="Offer Partially Recieved"}
        }
        else if(item[2]=='Recieved'){
            if(globalPOStatus=="PO Recieved"){globalPOStatus="PO Partially Recieved"}
            else{globalPOStatus="PO Not Recieved"}
            if(globalRFQStatus=="Offer Recieved" || globalRFQStatus==""){globalRFQStatus="Offer Recieved"}
            else{globalRFQStatus="Offer Partially Recieved"} 
        }
        else if(item[2]=='Not Recieved'){
            if(globalPOStatus=="PO Recieved"){globalPOStatus="PO Partially Recieved"}
            else{globalPOStatus="PO Not Recieved"}
            if(globalRFQStatus=="Offer Recieved"){globalRFQStatus="Offer Partially Recieved"}
            else{globalRFQStatus="Offer Not Recieved"}
            }   
        else{}
    });
    type=""
    typeAbb=""
    if(data.rEQType=="ro"){type="Serial No";typeAbb="SN";}
    else{type="Req Quantity";typeAbb="Qty";};
    html='<div class="rfq">'+
    '<div class="company">'+
        '<h5>'+data.customer+'</h5>'+
        '<button id="deleteRFQ'+data.rfqNoSG+'" onclick="deleteRFQModal(this)" class="deleteRFQ"><img src="images/trash-can-solid.svg"></button>'+
    '</div>'+
    '<div class="rfqTableSection">'+
        '<table class="rfqTable">'+
            '<tr class="header">'+
                '<td>RFQ Transaction No</td>'+
                '<td>Customer RFQ No</td>'+
               ' <td>Category</td>'+
                '<td>Type</td>'+
                '<td>Date</td>'+
                '<td>Due Date</td>'+
                // '<th>666</th>'+
                // '<th>777</th>'+
                // '<th>888</th>'+
                // '<th>999</th>'+
                // '<th>101</th>'+
                // '<th>102</th>'+
            '</tr>'+
            '<tr>'+
                '<td>'+data.rfqNoSG+'</td>'+
               ' <td>'+data.rEQNumber+'</td>'+
                '<td>'+data.rEQCategory.toUpperCase()+'</td>'+
                '<td>'+data.rEQType.toUpperCase()+'</td>'+
                '<td>'+data.rEQDate+'</td>'+
                '<td>'+String(data.deliveryDate).slice(0, 16)+'</td>'+
                // '<td>666</td>'+
                // '<td>777</td>'+
                // '<td>888</td>'+
                // '<td>999</td>'+
                // '<td>101</td>'+
                // '<td>102</td>'+
            '</tr>'+
        '</table>'+
    '</div>'+
    '<div class="offersTableSection">'+
        '<table class="offersTable">'+
            '<tr style="background:#183A69;color:white;font-weight:700;">'+
                '<th rowspan="2">Part No</th>'+
                '<th rowspan="2">Nomenclature</th>'+
                '<th rowspan="2">'+type+'</th>'+
                '<th>Offers</th>'+
                '<th rowspan="2">Status</th>'+
            '</tr>'+
            '<tr class="offersRow">'+
                '<td>'+
                    '<div class="offerDetailsSection">'+
                        '<div class="offerDetails">'+
                           ' <div>Id</div>'+
                           ' <div>A/U</div>'+
                           ' <div>'+typeAbb+'</div>'+
                            '<div>Price</div>'+
                            '<div>Edit</div>'+
                        '</div>'+
                    '</div>'+
                '</td>'+
            '</tr>'+
            '<tr class="offerDetailsRow">'+itemsHTML+
            //    ' <td>'+item[0]+'</td>'+
            //     '<td>'+item[1]+'</td>'+
            //     '<td>'+
            //         '<div class="offerDetailsSection">'+
            //            ' <div class="offerDetails">'+
            //                 '<div>111</div>'+
            //                 '<div>CM</div>'+
            //                 '<div>5</div>'+
            //                 '<div>$999</div>'+
            //         '    </div>'+
            //       '  </div>'+
            //    ' </td>'+
            //    ' <td>'+item[2]+'</td>'+
            // '</tr>'+
        '</table>'+
    '</div>'+
    '<div class="remarkSection">'+
        '<button class="remarks">Remarks</button>'+
        "<a href='"+data.document+"'><img class='downloadBtn' src='images/download-solid.svg' height='100px' alt='Download RFQ'></a>"+
        '<button class="requestStatus requestStatusOffer">'+globalRFQStatus+'</button>'+
        '<button class="requestStatus">'+globalPOStatus+'</button>'+
    '</div>'+
'</div>'
return html
}
function loadRFQs(){
    document.getElementById("rfqs").innerHTML="";
    request=url+'/api/aviation/getRFQs/';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $rfqs=$("#rfqs")
            items=data["items"]
            $.each(data["response"], function(i, item){
                // console.log(item.itemSet[i]);
                console.log(item);
                html=rfqHTML(item,items[i][item.rEQNumber],item.itemSet,items[i])
                $rfqs.append(html);
            });
        }
    });
}
function enableOfferModal(param){
    var id=param.id;
    id=id.replace("offer","")
    document.getElementById("offerModal").style.display="block";
    document.getElementById("offerModal").style.opacity="1";
    document.getElementById("body").style.filter="blur(5px)";
    request=url+"/api/aviation/getOfferDetails/"+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(response){
            data=response["response"]
            console.log(data);
            for(var key in data){
                console.log(key);
                if(key=='fileLoc'){document.getElementById(key).href=data[key];}
                else{document.getElementById(key).innerHTML=data[key];}
            }
            if(data['itemOfferStatus']=='Recieved'){document.getElementById("offerDetailHeader").style.background="#89560a9e"}
            else if(data['itemOfferStatus']=='Not Recieved'){document.getElementById("offerDetailHeader").style.background="#ff000045"}
            else{document.getElementById("offerDetailHeader").style.background="#00800078"}
        }
    });
}
function disableOfferDetailModal(){
    document.getElementById("offerModal").style.display="none";
    document.getElementById("offerModal").style.opacity="0";
    document.getElementById("body").style.filter="blur(0px)";
}
function addOffer(param){
    temp=param.id.split("|")
    localStorage.setItem("rfqNo",temp[0]);
    localStorage.setItem("partNo",temp[1]);
    localStorage.setItem("rfqType",temp[2]);
    localStorage.setItem("stid",temp[3]);
    window.location.href="addOfferForm.html";
}
function loadOfferForm(){
    localStorage.setItem("offerInlieusStatus","false");
    document.getElementById("stid").innerHTML="Transaction Id: "+localStorage.getItem("stid");
    document.getElementById("rfqNo").innerHTML="Customer RFQ No: "+localStorage.getItem("rfqNo");
    document.getElementById("partNo").innerHTML="Part No: "+localStorage.getItem("partNo");
    if(localStorage.getItem("rfqType")=="ro"){
        document.getElementById("quantity").innerHTML="RMA";
    }
    request=url+"/api/aviation/getOfferBOM/"+localStorage.getItem("rfqNo");
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            console.log(data);
            localStorage.setItem("bom",JSON.stringify(data["response"]));
            // console.log(data);
            //var $pn=$("#pn1");
            var $items=$("#itemSets");
            $.each(data, function(i,item) {
                $.each(this, function(i, item){
                //    $pn.append("<option value='"+item.id+"'>"+item.partNo+" | "+item.nomanclature+"</option>");
                    $items.append("<option onclick='addInlieuItem()' value='"+item.partNo+"'>"+item.nomanclature+" | "+item.nsn+"</option>");
                });
            });
        }
    });
}
function activeInlieusModal(){
    document.getElementById("formBody").style.filter="blur(5px)";
    document.getElementById("InleiusModal").style.display="block";
    document.getElementById("InleiusModal").style.opacity="1";
}
function inactiveInlieusModalCross(){
    if(document.getElementById("pn").innerHTML){
        if(document.getElementById("qtyLieu").value && document.getElementById("qtyLieu").value!=""){
            localStorage.setItem("offerInlieusStatus","true");
            document.getElementById("formBody").style.filter="blur(0px)";
            document.getElementById("InleiusModal").style.display="none";
            document.getElementById("InleiusModal").style.opacity="0";
        }
        else{
            localStorage.setItem("offerInlieusStatus","false");
            document.getElementById("formBody").style.filter="blur(0px)";
            document.getElementById("InleiusModal").style.display="none";
            document.getElementById("InleiusModal").style.opacity="0";
            document.getElementById("inlieuItemButton").innerHTML="Add In Lieu Item";
            document.getElementById("inlieuItemButton").style.background="#0f2f56";
        }
    }
    else{
        localStorage.setItem("offerInlieusStatus","false");
        document.getElementById("formBody").style.filter="blur(0px)";
        document.getElementById("InleiusModal").style.display="none";
        document.getElementById("InleiusModal").style.opacity="0";
        document.getElementById("inlieuItemButton").innerHTML="Add In Lieu Item";
        document.getElementById("inlieuItemButton").style.background="#0f2f56";
    }
}

function inactiveInlieusModal(){
    if(document.getElementById("pn").innerHTML){
        if(document.getElementById("qtyLieu").value){
            localStorage.setItem("offerInlieusStatus","true");
            document.getElementById("formBody").style.filter="blur(0px)";
            document.getElementById("InleiusModal").style.display="none";
            document.getElementById("InleiusModal").style.opacity="0";
            document.getElementById("qtyDiv").style.display="none";
            document.getElementById("qty").value="1";
        }
        else{
            document.getElementById("qtyLieu").style.borderColor="red";
        }
    }
    else{}
}
function addInlieuItem(partNo){
    localStorage.setItem("offerInlieusStatus","true");
    data=localStorage.getItem("bom");
    data=data.replace("[","");
    data=data.replace("]","");
    data=data.split("},");
    // html=addItemInRFQHtml(String(parseInt(temp)+1),partNo,data);
    nomenclature="";
    nsn="";
    $.each(data, function(i, item){
        if(item.slice(-1)=="}"){}
        else{item=item+'}'}
        temp=JSON.parse(item);
         // console.log(String(temp.partNo)+"=="+String(partNo))
        if(String(temp.partNo)==String(partNo)){
            nomenclature=temp.nomanclature;
            nsn=temp.nsn;
        }
      else{}
    });
    document.getElementById("pn").innerHTML=partNo;
    document.getElementById("nomanclature").innerHTML=nomenclature;
    document.getElementById("nsn").value=nsn;
    document.getElementById("inlieuItemButton").innerHTML="Edit Inlieu Item";
    document.getElementById("inlieuItemButton").style.background="rgb(88 124 47)";
}
function addOfferSubmit(){
    console.log("access");
    if(localStorage.getItem("offerInlieusStatus")=="true"){
        document.getElementById("qty").value='1';
    }else{}
    ids=["offerNo","date","validityDate","qty","unitPrice","offerDiscount","offerFreightCharges"]
    errors=[]
    itemStatus=true
    $.each(ids, function(i, item){
        temp=document.getElementById(item).value;
        if(temp){
            document.getElementById(item).style.borderColor="grey";
        }
        else{
            errors.push(item)
            itemStatus=false
        }
    });

    if(itemStatus){
        console.log("access");
        unitPrice=document.getElementById("unitPrice").value;
        offerDiscount=document.getElementById("offerDiscount").value;
        offerFreightCharges =document.getElementById("offerFreightCharges").value;
        qty=document.getElementById("qty").value;
        currentUnitPrice=0
        finalPrice=0
        if(offerDiscount=="0" || offerDiscount==0){
        }
        else{
            temp=(parseFloat(offerDiscount)/100)*parseFloat(unitPrice);
            currentUnitPrice=parseFloat(unitPrice)-temp;
        }
        if(offerFreightCharges =="0" || offerFreightCharges ==0){
            document.getElementById("qty").style.borderColor="red";
        }
        else{
            temp=(parseFloat(offerFreightCharges)/100)*currentUnitPrice
            currentUnitPrice=currentUnitPrice+temp;
        }
        if(qty==0 || qty=="0"){
            document.getElementById("qty").style.borderColor="red";
        }
        else{
            finalPrice=currentUnitPrice*parseInt(qty);
            // console.log(finalPrice);
        }
        data={"finalPrice":finalPrice,"partNo":localStorage.getItem("partNo"),"rfqNo":localStorage.getItem("rfqNo")}
        $.each(ids, function(i, item){
            data[item]=document.getElementById(item).value;
        });
        data["rfqType"]=localStorage.getItem("rfqType");
        data["offerInlieusStatus"]=localStorage.getItem("offerInlieusStatus");
        if(localStorage.getItem("offerInlieusStatus")=="true"){
            console.log("access");
            data["lieuPartNumber"]=document.getElementById("pn").innerHTML;
            data["lieuNomanclature"]=document.getElementById("nomanclature").innerHTML;
            data["lieuNsn"]=document.getElementById("nsn").value;
            data["qtyLieu"]=document.getElementById("qtyLieu").value;
        }else{}
        var fd = new FormData();
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
            // fd.append('file',files[0]);
            // data["doc"]=fd;
            postData=JSON.stringify(data);
            request=url+'/api/aviation/addOffer/';
            console.log("access");
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                data:postData,
                success: function(data){
                    // alert("Offer Successfully Added!")
                    // window.location.href="RFQs.html"
                    if(data["response"]=="exist"){
                        document.getElementById("offerNo").style.borderColor="red";
                        alert("Offer Already Exist!");
                    }
                    else{
                    document.getElementById("offerNo").style.borderColor="lightgrey";
                    document.getElementById("successti").innerHTML=localStorage.getItem("stid");
                    document.getElementById("successCustomerRFQ").innerHTML=localStorage.getItem("rfqNo");
                    document.getElementById("successPartNo").innerHTML=localStorage.getItem("partNo");
                    document.getElementById("formBody").style.filter="blur(5px)";
                    document.getElementById("ignismyModal").style.display="block";
                    document.getElementById("ignismyModal").style.opacity="1";
                    // document.getElementById("customerRFQ").innerHTML=document.getElementById("rfqNo").value;
                    document.getElementById("offerDocForm").action=url+"/api/aviation/uploadOfferDocument/"+data["reference"];
                    }
                }
            });
        }else{alert("Please Select File!");}
    }
    else{
        $.each(errors, function(i, item){
            document.getElementById(item).style.borderColor="red";
        });
    }
}
//SEARCH RFQ

function submitOfferDocument(){
    document.getElementById("offerDocForm").submit();
}

function searchRFQ(){
    search=document.getElementById("search").value;
    if(search.length==0){
        loadRFQs();
    }
    else if(search.length>=2){
    document.getElementById("rfqs").innerHTML="";
    data={"search":search}
    postData=JSON.stringify(data)
    request=url+'/api/aviation/searchRFQ/';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'POST',
        url: request,
        data:postData,
        success: function(data){
            // console.log(data);
            $rfqs=$("#rfqs")
            items=data["items"]
            $.each(data["response"], function(i, item){
                // console.log(item.itemSet[i]);
                // console.log(items[i]);
                html=rfqHTML(item,items[i][item.rEQNumber],item.itemSet,items[i])
                $rfqs.append(html);
            });
        }
    });
    }
    else{}
}
function loadPos(){
    // console.log("access");
    document.getElementById("department").innerHTML=localStorage.getItem("department").toUpperCase();
    const email=localStorage.getItem("email");
    let name=email.split("@");
    document.getElementById("user-name").innerHTML=name[0];
    let width = screen.width;
    if(width<=1600){
        let options=document.getElementById("menubar").innerHTML;
        document.getElementById("menubar").innerHTML="<button onclick='showMenubar()' style='box-shadow: none;border: none;'><img src='images/bars-solid.svg' height='30px'></button>";
        document.getElementById("menubarResponsive").innerHTML=options;
        document.getElementById("menubarResponsive").style.display="none";
        // document.getElementsByClassName("menubar").style.width="100%";
        document.getElementById("customer").style.display="none";
    }else{}
}
function generateFields(){
    total=document.getElementById("totalItem").value;
}
itemSet=""
function loadPosForm(){
    customer=document.getElementById("customer").value;
    customer=customer.toLowerCase();
    console.log(customer);
    request=url+"/api/aviation/getRfqOfferItems/"+customer;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            // console.log(data);
            itemSet=data["response"];
            searchRfqOfferPartNo();
        }
    });

}
function loadPosAmendedForm(){
    customer=document.getElementById("customer").value;
    customer=customer.toLowerCase();
    console.log(customer);
    request=url+"/api/aviation/getRfqOfferItemsAmended/"+customer+"/"+localStorage.getItem("poId");
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            console.log(data);
            itemSet=data["response"];
            console.log(itemSet);
            addSelectedPOItemsAmended();
            searchRfqOfferPartNo();
        }
    });
}
function itemHtml(item){
    if(item.category=='RFQ'){
        category='<div>'+item.rfq+'</div>';
        partNo=item.partNo;
    }
    else{
        category='<div>'+item.rfq+' | '+item.offerNo+'</div>'
        partNo=item.partNo+" | "+item.lieusPartNo;
    }
    html='<button id="item'+item.id+'rfq'+item.rfq+'" onclick="addPOItemToList(this)" class="item">'+
    '<div class="poItemOptions">'+
    '<div>'+partNo+'</div>'+
    '<div>'+item.nomenclature+'</div>'+
    category+
    '<div>'+item.quantity+'</div>'+
    '<div></button>'
    return html
}
selectedItems=[]
function searchRfqOfferPartNo(){
    search=document.getElementById("search").value;
    document.getElementById("rfqs").innerHTML="";
    document.getElementById("offers").innerHTML="";
    if(search){
    // console.log(itemSet);
    filtered=[]
    $rfqs=$("#rfqs");
    $offers=$("#offers");
    $.each(itemSet, function(i, item){
        if(String(item.partNo).search(search)!=-1 || String(item.rfq).search(search)!=-1 || String(item.sgRFQ).search(search)!=-1){
            // // console.log(String(item.partNo).search(search))
            if(String(item.category)=='RFQ'){
                temp='item'+item.id+'rfq'+item.rfq;
                temp2=selectedItems.includes(temp);
                if(temp2){}
                else{
                    html=itemHtml(item);
                    $rfqs.append(html);
                // // console.log(item);
                }
            }
            else if(String(item.category)=='Offer'){
                temp='item'+item.id+'rfq'+item.rfq;
                temp2=selectedItems.includes(temp);
                if(temp2){}
                else{
                    html=itemHtml(item);
                    $offers.append(html);
                }
                // // console.log(item);
            }
            else{}
        }
        else{}
    });
    }
    else{
        $rfqs=$("#rfqs");
        $offers=$("#offers");
        $.each(itemSet, function(i, item){
                if(String(item.category)=='RFQ'){
                temp='item'+item.id+'rfq'+item.rfq;
                temp2=selectedItems.includes(temp);
                if(temp2){}
                else{
                    html=itemHtml(item);
                    $rfqs.append(html);
                }
                }
                else if(String(item.category)=='Offer'){
                    temp='item'+item.id+'rfq'+item.rfq;
                    temp2=selectedItems.includes(temp);
                    if(temp2){}
                    else{
                        html=itemHtml(item);
                        $offers.append(html);
                    }
                }
                else{}
        });
    }
}
function poItemHTML(item){
    if(item.offerNo){offerNo=item.offerNo}
    else{offerNo="-"}
    html='<li class="poListItem" id="listItem'+item.id+'rfq'+item.rfq+'">'+
    '<div class="poFormTempSeletedItem">'+
    '<div><input type="checkbox"></div>'+
    '<div>'+item.partNo+' | '+item.lieusPartNo+'</div>'+
    '<div>'+item.nomenclature+'</div>'+
    '<div>'+item.rfq+' | '+offerNo+'</div>'+
    // '<strong>Quantity: </strong>'+item.quantity+'<br>'+
    '<div><img src="images/delete-left-solid.svg" class="removePOListItem" onclick="removeItemFromSelected(this)" id="removeItem'+item.id+'rfq'+item.rfq+'"></div></div></li>'
    return html
}
function addPOItemToList(param){
    //// console.log(param);
    id=param.id;
    temp=id.split("rfq");
    itemId=temp[0].replace("item","");
    rfqId=temp[1];
    $list=$("#poItems");
    // console.log(id);
    $.each(itemSet, function(i, item){
        if(String(item.id)==itemId && String(item.rfq)==rfqId){
            // console.log("macthed",id);
            // console.log(item);
            html=poItemHTML(item);
            $list.append(html);
            document.getElementById(param.id).style.display="none";
            selectedItems.push(param.id);
        }
        else{}
    });
}
function removeItemFromSelected(param){
    id=param.id;
    item=id.replace("removeItem","item");
    const index = selectedItems.indexOf(item);
    if (index > -1) { // only splice array when item is found
        selectedItems.splice(index, 1); // 2nd parameter means remove one item only
    }
    listItem=id.replace("removeItem","listItem");
    document.getElementById(listItem).style.display="none";
    // console.log(selectedItems);
    if(selectedItems.length===0){document.getElementById("poItems").innerHTML="";searchRfqOfferPartNo();}
    else{}
    searchRfqOfferPartNo();
}
function addSelectedPOItemsHTML(partNo,category,quantity,nomenclature,discountPercentage,offerFrieghtChargersPercentage,price,item,total){
    html='<div><p>'+partNo+'</p></div>'+
    '<div><p>'+nomenclature+'</p></div>'+
    '<div><p>'+category+'</p></div>'+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"value' placeholder='Enter Quantity' value='"+quantity+"'></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"price' placeholder='Enter Unit Price' value='"+price+"'></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"discount' placeholder='Enter Discount' value='"+discountPercentage+"' ></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"frieght' placeholder='Enter Frieght Charges %' value='"+offerFrieghtChargersPercentage+"'></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' readonly id='"+item+"total' placeholder='Enter Price' value='"+total+"'></div>"
    // "<div><input type='text' id='discount"+id+"' placeholder='Enter Discount %' value='"+discountPercentage+"'></div>"
    return html
}
function addSelectedPOItemsAmendedHTML(partNo,category,quantity,nomenclature,discountPercentage,offerFrieghtChargersPercentage,price,item,total){
    html='<div><p>'+partNo+'</p></div>'+
    '<div><p>'+nomenclature+'</p></div>'+
    '<div><p>'+category+'</p></div>'+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"value' placeholder='Enter Quantity' value='"+quantity+"'></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"price' placeholder='Enter Unit Price' value='"+price+"'></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"discount' placeholder='Enter Discount' value='"+discountPercentage+"' ></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' id='"+item+"frieght' placeholder='Enter Frieght Charges %' value='"+offerFrieghtChargersPercentage+"'></div>"+
    "<div><input type='number' oninput='changePOItemTotal(this)' readonly id='"+item+"total' placeholder='Enter Price' value='"+total+"'></div>"
    // "<div><input type='text' id='discount"+id+"' placeholder='Enter Discount %' value='"+discountPercentage+"'></div>"
    return html
}
function addSelectedPOItems(){
    document.getElementById("addedPOItems").innerHTML="";
    document.getElementById("myModal").style.display="none";
    $addedPOItems=$("#addedPOItems");
    // console.log(selectedItems);
    $.each(selectedItems, function(i, item){
        id=item;
        temp=id.split("rfq");
        itemId=temp[0].replace("item","");
        rfqId=temp[1];
        category="";
        partNo="";
        quantity=0;
        nomenclature=0;
        discountPercentage=0;
        offerFrieghtChargersPercentage=0;
        price=0;
        total=0;
        // console.log(itemSet);
        $.each(itemSet, function(i, data){
            if(String(data.id)==itemId && String(data.rfq)==rfqId){
                category=data.category;
                try{
                if(data.lieusPartNo=="-" || data.lieusPartNo=="No Offer Recieved"){
                    partNo=data.partNo;}
                else{partNo=data.partNo+" | "+data.lieusPartNo}
                }
                catch{partNo=data.partNo;}
                quantity=data.quantity;
                nomenclature=data.nomenclature;
                discountPercentage=data.discountPercentage;
                offerFrieghtChargersPercentage=data.offerFrieghtChargersPercentage;
                price=data.price;
                temp=(parseFloat(quantity)*parseFloat(price))-(parseFloat(discountPercentage)*parseFloat(price))
                total=temp+(parseFloat(temp)*parseFloat(offerFrieghtChargersPercentage))
            }
            else{}
        });
        html=addSelectedPOItemsHTML(partNo,category,quantity,nomenclature,discountPercentage,offerFrieghtChargersPercentage,price,item,total);
        $addedPOItems.append(html);
    });
}
function addSelectedPOItemsAmended(){
    document.getElementById("addedPOItems").innerHTML="";
    document.getElementById("myModal").style.display="none";
    $addedPOItems=$("#addedPOItems");
    // console.log(selectedItems);
    $.each(selectedItems, function(i, item){
        id=item;
        if(id.search(" | ")!=-1){
            $.each(itemSet, function(i, data){
                if(String(data.partNo)==id){
                    console.log("access")
                    temp=(parseFloat(data.quantity)*parseFloat(data.price))-(parseFloat(data.discountPercent)*parseFloat(data.price))
                    total=temp+(parseFloat(temp)*parseFloat(data.frieghtPercent))
                    html=addSelectedPOItemsAmendedHTML(id,'Offer',data.quantity,data.nomenclature,data.discountPercent,data.frieghtPercent,data.price,item,total);
                    $addedPOItems.append(html);
                }
            });
        }
        else{
        temp=id.split("rfq");
        itemId=temp[0].replace("item","");
        rfqId=temp[1];
        category="";
        partNo="";
        quantity=0;
        nomenclature="";
        discountPercentage=0;
        offerFrieghtChargersPercentage=0;
        price=0;
        total=0;
        // console.log(itemSet);
        $.each(itemSet, function(i, data){
            // console.log("Validate Now")
            // console.log(data);
            // console.log(itemSet);
            // console.log(itemId);
            if(String(data.rfq)==rfqId && String(data.id)==itemId && String(data.poId)==String(localStorage.getItem("poId"))){
                // console.log(data.id);
                console.log(data);
                category=data.category;
                partNo=data.partNo;
                quantity=data.quantity;
                nomenclature=data.nomenclature;
                discountPercentage=data.discountPercentage;
                offerFrieghtChargersPercentage=data.offerFrieghtChargersPercentage;
                price=data.price;
                temp=(parseFloat(quantity)*parseFloat(price))-(parseFloat(discountPercentage)*parseFloat(price))
                total=temp+(parseFloat(temp)*parseFloat(offerFrieghtChargersPercentage))
                html=addSelectedPOItemsAmendedHTML(partNo,category,quantity,nomenclature,discountPercentage,offerFrieghtChargersPercentage,price,item,total);
                //html=addSelectedPOItemsHTML(partNo,category,tempId,quantity,tempId2,tempId3);
                $addedPOItems.append(html);
                return false;
            }
            else{}
        });}
    });
}
function setDeliverDate(){
    var days = document.getElementById("days").value;
    var date = new Date(document.getElementById("date").value);
    date.setDate(date.getDate() + parseInt(days));
    try{document.getElementById("delivery").valueAsDate=date;}
    catch{}
    try{document.getElementById("validityDate").valueAsDate=date;}
    catch{}
}

function addPO(){
    // console.log("access")
    ids=['no','date','delivery','customer','currency']
    priceIds=[];
    valuesIds=[];
    discounts=[];
    frieghts=[];
    $.each(selectedItems, function(i, item){
        ids.push(item+'value');
        ids.push(item+'price');
        ids.push(item+'discount');
        ids.push(item+"frieght");
        valuesIds.push(item+'value');
        priceIds.push(item+'price');
        discounts.push(item+'discount');
        frieghts.push(item+'frieght');
    });
    errors=[]
    $.each(ids, function(i, id){
        if(document.getElementById(id).value && document.getElementById(id).value!="select"){
            document.getElementById(id).style.borderColor="grey";
        }
        else{errors.push(id)}
    });
    if(errors.length == 0){
        data={}
        tempIds=['no','date','delivery','customer','currency']
        tempIds2=ids;
        // console.log(tempIds2)
        $.each(tempIds, function(i, id){
            data[id]=document.getElementById(id).value;
        });
        quantity=[]
        itemIds=[]
        itemPrices=[]
        itemDiscounts=[]
        frieght=[]
        // console.log(valuesIds)
        $.each(valuesIds, function(i, id){
            quantity.push(document.getElementById(id).value);
            itemPrices.push(document.getElementById(priceIds[i]).value);
            itemDiscounts.push(document.getElementById(discounts[i]).value);
            frieght.push(document.getElementById(frieghts[i]).value)
            temp=id.split("rfq");
            itemId=temp[0].replace("item","");
            itemIds.push(itemId);
        });
        data["quantity"]=quantity;
        data["items"]=itemIds;
        data["prices"]=itemPrices;
        data["discounts"]=itemDiscounts;
        data["frieght"]=frieght;
        postData=JSON.stringify(data)
        var fd = new FormData();
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
        request=url+"/api/aviation/addPO/"
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
            data:postData,
            success: function(data){
                if(data["response"]=="exist"){
                    document.getElementById("no").style.borderColor="red";
                    alert("PO Already Exist!");
                    return false
                }
                else{
                // console.log(data);
                // window.location.href="pos.html";
                document.getElementById("no").style.borderColor="lightgrey";
                document.getElementById("successti").innerHTML=data["code"];
                document.getElementById("successAmount").innerHTML=data["amount"];
                document.getElementById("formBody").style.filter="blur(5px)";
                document.getElementById("ignismyModal").style.display="block";
                document.getElementById("ignismyModal").style.opacity="1";
                document.getElementById("poDocForm").action=url+"/api/aviation/uploadPODocument/"+data["code"];
                return false;}
            }
        });}else{alert("Please Select File!");return false;}
    }
    else{
        $.each(errors, function(i, id){document.getElementById(id).style.borderColor="red"});
    }
}
function submitPODocument(){
    document.getElementById("poDocForm").submit();
}
function changePOItemTotal(param){
    var id=param.id;
    id=id.replace("value","");
    id=id.replace("price","");
    id=id.replace("discount","");
    id=id.replace("frieght","");
    id=id.replace("total","");
    quantity=document.getElementById(id+"value").value;
    price=document.getElementById(id+"price").value;
    discount=document.getElementById(id+"discount").value;
    frieght=document.getElementById(id+"frieght").value;
    // total=document.getElementById("total"+id).value;
    temp=parseFloat(price)*parseFloat(quantity);
    temp2=temp-((parseFloat(discount)/100)*parseFloat(temp));
    temp3=temp2+((parseFloat(frieght)/100)*temp2);
    document.getElementById(id+"total").value=temp3;
    // console.log(temp3);
    // console.log(quantity,price,parseFloat(discount),frieght);
}
function posHTML(item){
    if(item.status=='amended'){tag="#5c5b5b"}
    else{tag="rgb(26 107 26)"}
    html='<div class="poTag" style="background:'+tag+';"><div id="card'+item.id+'" onclick="showPODetails(this)" class="basic-card basic-card-aqua">'+
    '<div class="card-content">'+
        '<span class="card-title">'+item.customer+'</span>'+
        '<p class="card-text">'+
            '<ul>'+
                '<li>Customer PO No: '+item.number+'<span id="poNumber"></span></li>'+
                '<li>Customer PO Date: '+item.date+'<span id="poNumber"></span></li>'+
                '<li>Total Items:<span id="poNumber'+item.id+'"></span></li>'+
                '<li>PO Total Amount: '+item.totalAmount+'<span id="poNumber"></span></li>'+
                '<li>PO Status: '+item.status.toUpperCase()+'<span id="poNumber"></span></li>'+
            '</ul>'+
        '</p>'+
    '</div>'+
    '<div class="card-link" style="background:'+tag+';">'+
    '<div class="partsDescription" >'+
        '<table class="parts" id="poItems'+item.id+'">'+
        '<tr>'+
        '<th style="background:'+tag+';">Part No</th>'+
        '<th style="background:'+tag+';">Nomenclature</th>'+
        '<th style="background:'+tag+';">Reference</th>'+
        '<th style="background:'+tag+';">Qty</th>'+
        '<th style="background:'+tag+';">Unit Price</th>'+
        '<th style="background:'+tag+';">OC Status</th>'+
        '</tr>'+     
        '</table>'+
    '</div>'+
    '</div>'+
    '</div></div>'
    return html
}
function poItemsTableHTML(item){
    html='<tr>'+
    '<td>'+item.partNo+'</td>'+
    '<td>'+item.nomenclature+'</td>'+
    '<td>'+item.reference+'</td>'+
    '<td>'+item.quantity+'</td>'+
    '<td>'+item.price+'</td>'+
    '<td>'+item.status+'</td>'+
    '</tr>'
    return html
}
function poItemsDetailTableHTML(item){
    html='<tr>'+
    '<td>'+item.partNo+'</td>'+
    '<td>'+item.nomenclature+'</td>'+
    '<td>'+item.reference+'</td>'+
    '<td>'+item.quantity+'</td>'+
    '<td>'+item.price+'</td>'+
    '<td>'+item.status+'</td>'+
    '<td>'+item.discountPercent+'</td>'+
    '<td>'+item.frieghtPercent+'</td>'+
    '</tr>'
    return html
}
function ocItemsDetailTableHTML(item){
    bg="white"
    if(item.fileloc.slice(-1)=="-"){}
    else{bg="lightgreen"}
    html='<tr>'+
    '<td>'+item.partNo+'</td>'+
    '<td>'+item.nomenclature+'</td>'+
    '<td>'+item.alternate+'</td>'+
    '<td>'+item.quantity+'</td>'+
    '<td>'+item.price+'</td>'+
    '<td>'+item.discountPercent+'</td>'+
    '<td>'+item.frieghtPercent+'</td>'+
    '<td>'+item.status+'</td>'+
    '<td style="background:'+bg+';"><a href="'+item.fileloc+'"><img src="images/download-solid.svg" height="18px"></a></td>'+
    '<td><button id="edit'+item.id+'" class="editOCButton" onclick="editOC(this)">Edit</button>'+
    '</tr>'
    return html
}
function loadPOs(){
    // // console.log("access");
    document.getElementById("department").innerHTML=localStorage.getItem("department").toUpperCase();
    const email=localStorage.getItem("email");
    let name=email.split("@");
    document.getElementById("user-name").innerHTML=name[0];
    let width = screen.width;
    if(width<=1600){
        let options=document.getElementById("menubar").innerHTML;
        document.getElementById("menubar").innerHTML="<button onclick='showMenubar()' style='box-shadow: none;border: none;'><img src='images/bars-solid.svg' height='30px'></button>";
        document.getElementById("menubarResponsive").innerHTML=options;
        document.getElementById("menubarResponsive").style.display="none";
        // document.getElementsByClassName("menubar").style.width="100%";
        document.getElementById("customer").style.display="none";
    }else{}
    request=url+'/api/aviation/getAllPOs/';
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            $pos=$("#pos");
            $.each(data["pos"], function(i, item){
                html=posHTML(item);
                $pos.append(html);
                $items=$('#poItems'+item.id)
                count=0;
                $.each(data["items"], function(j, item2){
                    if(item.number==item2.poNumber){
                        // console.log("item")
                        html2=poItemsTableHTML(item2);
                        $items.append(html2);
                        count+=1;
                    }else{}
                });
                document.getElementById("poNumber"+item.id).innerHTML=count;
            });
        }
    });
}
function goToSignIn(){
    window.location.href="signInForm.html";
}
function signOut(){
    localStorage.clear();
    window.location.href="landingPage.html";
}
function searchPO(){
    search=document.getElementById("search").value;
    if(search.length==0){
        document.getElementById("pos").innerHTML="";
        loadPOs();
    }
    else if(search.length>=2){
        document.getElementById("pos").innerHTML="";
        request=url+'/api/aviation/searchPO/'+search;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $pos=$("#pos");
                $.each(data["pos"], function(i, item){
                    html=posHTML(item);
                    $pos.append(html);
                    $items=$('#poItems'+item.id)
                    count=0;
                    $.each(data["items"], function(j, item2){
                        if(item.number==item2.poNumber){
                            // console.log("item")
                            html2=poItemsTableHTML(item2);
                            $items.append(html2);
                            count+=1;
                        }else{}
                    });
                    document.getElementById("poNumber"+item.id).innerHTML=count;
                });
            }
        });
    }
    else{
    }
}
function showPODetails(param){
    document.getElementById("myModal").style.display="block";
    id=param.id;
    id=id.replace("card","");
    request=url+'/api/aviation/getPODetail/'+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            console.log(data);
            // $("#poDetailsNo").text(data["po"]["number"]);
            // $("#poDetailsDate").text(data["po"]["date"]);
            // $("#poDetailsDelivery").text(data["po"]["delivery"]);
            // $("#poDetailsItemAmount").text(data["po"]["totalAmount"]);
            // $("#poDetailsCustomer").text(data["po"]["customer"]);
            document.getElementById("body").style.filter="blur(5px)";
            document.getElementById("poDetailsNo").innerHTML=data["po"]["number"];
            document.getElementById("poDetailsDate").innerHTML=data["po"]["date"];  
            document.getElementById("poDetailsDelivery").innerHTML=data["po"]["delivery"];    
            document.getElementById("poDetailsItemAmount").innerHTML=data["po"]["totalAmount"];
            document.getElementById("poDetailsCustomer").innerHTML=data["po"]["customer"];
            document.getElementById("ocDetailsItemAmount").innerHTML=data["oc"]["totalAmount"];
            document.getElementById("ocDetailsNumber").innerHTML=data["oc"]["ocNumber"];
            document.getElementById("ocDoc").href=data["oc"]["fileLoc"];
            if(data["po"]["status"]=="amended"){
                document.getElementById("detailBody").style.background="rgb(175 176 177)";
                document.getElementById("headBody").style.background="#6c6b6b";
                document.getElementById("detailBody").style.background="rgb(175, 176, 177)";
                $("#detailBody button").css("background-color","rgb(108, 107, 107)");
                $("#detailBody th").css("background-color","rgb(108, 107, 107)");
                amendPOColor="rgb(108, 107, 107)";
            }
            else{
                document.getElementById("detailBody").style.background="#467c46";
                document.getElementById("headBody").style.background="rgb(26 107 26)";
                document.getElementById("detailBody").style.background="rgb(123 206 123 / 43%)";
                $("#detailBody button").css("background-color","rgb(26 107 26)");
                $("#detailBody th").css("background-color","rgb(26 107 26)");
                amendPOColor='rgb(26 107 26)';
            }
            document.getElementById("poDoc").href=data["po"]["fileLoc"];
            $table=$("#poDetailsItem");
            document.getElementById("poDetailsItem").innerHTML="";
            html="<tr><th>Part No</th><th>Nomenclature</th><th>Reference</th><th>Qty</th><th>Unit Price</th><th>OC Status</th><th>Discount Percent</th><th>Frieght Percent</th></tr> "
            $table.append(html);
            count=0
            poAmendStatus="Not Recieved"
            $.each(data["items"], function(j, item){
                html=poItemsDetailTableHTML(item);
                $table.append(html);
                if(item.status=="OC Recieved"){
                    poAmendStatus="OC Recieved";
                }
                else{}
                count+=1;
            });
            $table2=$("#ocDetailsItem");
            document.getElementById("ocDetailsItem").innerHTML="";
            html="<tr><th>Part No</th><th>Nomenclature</th><th>Alternate</th><th>Qty</th><th>Unit Price</th><th>Discount Percent</th><th>Frieght Percent</th><th>Spmt Status</th><th>Document</th><th>Edit OC</th></tr> "
            $table2.append(html);
            count2=0
            $.each(data["ocItems"],function(k,item){
                html=ocItemsDetailTableHTML(item);
                $table2.append(html);
                count2+=1;
            });
            document.getElementById("poDetailsTotal").innerHTML=count;
            document.getElementById("ocDetailsTotal").innerHTML=count2;
            document.getElementById("amendPODiv").innerHTML="";
            if(poAmendStatus=="OC Recieved"){}
            else{
                $('#amendPODiv').append('<button id="amend'+data["po"]["id"]+'" style="background:'+amendPOColor+';" onclick="amendPOForm(this)" class="amendPO">AMEND PO</button>');
            }
            $('#amendPODiv').append('<button id="oc'+data["po"]["id"]+'" style="background:black;" onclick="createOC(this)" class="amendPO">Confirm Order</button>');
            // console.log(data);
        }
    });
}
function closePODetail(){
    document.getElementById("myModal").style.display="none";
    document.getElementById("body").style.filter="blur(0px)";
}
function reviseOffer(param){
    id=param.id;
    id=id.replace("revise","");
    localStorage.setItem("offerId",id);
    window.location.href="editOfferForm.html";
}
function loadEditOfferForm(){
    document.getElementById("loader").style.display="block";
    id=localStorage.getItem("offerId");
    request=url+'/api/aviation/getOffer/'+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            // console.log(data);
            localStorage.setItem("rfqNo",data["response"]["rfqNumber"]);
            localStorage.setItem("partNo",data["response"]["partNo"]);
            document.getElementById("rfgNo").innerHTML="RFQ No: "+data["response"]["rfqNumber"];
            document.getElementById("partNo").innerHTML="Part No: "+data["response"]["partNo"];
            document.getElementById("offerNo").value=data["response"]["offerNumber"];
            document.getElementById("date").value=String(data["response"]["date"]);
            document.getElementById("validityDate").value=String(data["response"]["validity"]);
            document.getElementById("qty").value=data["response"]["quantity"];
            document.getElementById("unitPrice").value=data["response"]["price"];
            document.getElementById("offerDiscount").value=data["response"]["discount"];
            document.getElementById("offerFreightCharges").value=data["response"]["offerFrieghtChargersPercentage"];
            // document.getElementById("deliveryDate").value=data["response"]["deliveryDateAsPerLHDOffer"];
            request=url+"/api/aviation/getOfferBOM/"+data["response"]["rfqNumber"];
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'GET',
                url: request,
                success: function(response){
                    // console.log(response);
                    localStorage.setItem("bom",JSON.stringify(response["response"]));
                    // // console.log(data);
                    //var $pn=$("#pn1");
                    var $items=$("#itemSets");
                    $.each(response, function(i,item) {
                        $.each(this, function(i, item){
                        //    $pn.append("<option value='"+item.id+"'>"+item.partNo+" | "+item.nomanclature+"</option>");
                            $items.append("<option onclick='addInlieuItem()' value='"+item.partNo+"'>"+item.nomanclature+" | "+item.nsn+"</option>");
                        });
                    });
                    if(data["response"]["alternate"]=="-"){
                        localStorage.setItem("offerInlieusStatus","false");
                    }
                    else{
                        localStorage.setItem("offerInlieusStatus","true");
                        document.getElementById("searchInlieuPartNo").value=data["response"]["lieusPartNo"];
                        document.getElementById("qtyLieu").value=data["response"]["lieusQuantity"];
                        document.getElementById("inlieuItemButton").innerHTML="Edit Inlieu Item";
                        document.getElementById("inlieuItemButton").style.background="rgb(88 124 47)";
                    }
                    var val = document.getElementById("searchInlieuPartNo").value;
                    var opts = document.getElementById('itemSets').childNodes;
                    for (var i = 0; i < opts.length; i++) {
                    if (opts[i].value === val) {
                        addInlieuItem(opts[i].value);
                        break;
                    }
                    }
                    document.getElementById("loader").style.display="none";
                }
            });
        }
    });
}
function reviseOfferSubmit(){
    // console.log("access");
    if(localStorage.getItem("offerInlieusStatus")=="true"){
        document.getElementById("qty").value='1';
    }else{}
    ids=["offerNo","date","validityDate","qty","unitPrice","offerDiscount","offerFreightCharges"]
    errors=[]
    itemStatus=true
    $.each(ids, function(i, item){
        temp=document.getElementById(item).value;
        if(temp){
            document.getElementById(item).style.borderColor="grey";
        }
        else{
            errors.push(item)
            itemStatus=false
        }
    });

    if(itemStatus){
        // console.log("access");
        unitPrice=document.getElementById("unitPrice").value;
        offerDiscount=document.getElementById("offerDiscount").value;
        offerFreightCharges =document.getElementById("offerFreightCharges").value;
        qty=document.getElementById("qty").value;
        currentUnitPrice=0
        finalPrice=0
        if(offerDiscount=="0" || offerDiscount==0){
        }
        else{
            temp=(parseFloat(offerDiscount)/100)*parseFloat(unitPrice);
            currentUnitPrice=parseFloat(unitPrice)-temp;
        }
        if(offerFreightCharges =="0" || offerFreightCharges ==0){
            document.getElementById("qty").style.borderColor="red";
        }
        else{
            temp=(parseFloat(offerFreightCharges)/100)*currentUnitPrice
            currentUnitPrice=currentUnitPrice+temp;
        }
        if(qty==0 || qty=="0"){
            document.getElementById("qty").style.borderColor="red";
        }
        else{
            finalPrice=currentUnitPrice*parseInt(qty);
            // // console.log(finalPrice);
        }
        data={"finalPrice":finalPrice,"partNo":localStorage.getItem("partNo"),"rfqNo":localStorage.getItem("rfqNo")}
        $.each(ids, function(i, item){
            data[item]=document.getElementById(item).value;
        });
        // data["rfqType"]=localStorage.getItem("rfqType");
        data["offerInlieusStatus"]=localStorage.getItem("offerInlieusStatus");
        if(localStorage.getItem("offerInlieusStatus")=="true"){
            // console.log("access");
            data["lieuPartNumber"]=document.getElementById("pn").innerHTML;
            data["lieuNomanclature"]=document.getElementById("nomanclature").innerHTML;
            data["lieuNsn"]=document.getElementById("nsn").value;
            data["qtyLieu"]=document.getElementById("qtyLieu").value;
        }else{}
        var fd = new FormData();
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
            // fd.append('file',files[0]);
            // data["doc"]=fd;
            postData=JSON.stringify(data);
            request=url+'/api/aviation/reviseOffer/';
            // console.log("access");
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                data:postData,
                success: function(data){
                    // alert("Offer Successfully Added!")
                    // window.location.href="RFQs.html"
                    // document.getElementById("successti").innerHTML=localStorage.getItem("stid");
                    document.getElementById("successCustomerRFQ").innerHTML=localStorage.getItem("rfqNo");
                    document.getElementById("successPartNo").innerHTML=localStorage.getItem("partNo");
                    document.getElementById("formBody").style.filter="blur(5px)";
                    document.getElementById("ignismyModal").style.display="block";
                    document.getElementById("ignismyModal").style.opacity="1";
                    // document.getElementById("customerRFQ").innerHTML=document.getElementById("rfqNo").value;
                    document.getElementById("offerDocForm").action=url+"/api/aviation/uploadOfferDocument/"+data["reference"];
                }
            });
        }else{alert("Please Select File!");}
    }
    else{
        $.each(errors, function(i, item){
            document.getElementById(item).style.borderColor="red";
        });
    }
}
function amendPOForm(param){
    id=param.id;
    id=id.replace("amend","");
    localStorage.setItem("poId",id);
    window.location.href="amendPOForm.html";
}
function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].text== valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
}
function loadAmendPOForm(){
    id=localStorage.getItem("poId");
    // console.log(id);
    request=url+'/api/aviation/getPO/'+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            // console.log(data);
            objSelect=document.getElementById("customer");
            setSelectedValue(objSelect, data["po"]["customer"]);
            document.getElementById("no").value=data["po"]["number"];
            document.getElementById("date").value=data["po"]["date"];
            document.getElementById("delivery").value=data["po"]["deliveryPeriod"];
            selectedItems=data["items"];
            loadPosAmendedForm();
        }
    });
}
function amendPO(){
    // console.log("access")
    ids=['no','date','delivery','customer']
    priceIds=[]
    valuesIds=[]
    discounts=[]
    frieghts=[];
    $.each(selectedItems, function(i, item){
        ids.push(item+'value');
        ids.push(item+'price');
        ids.push(item+'discount');
        ids.push(item+"frieght");
        valuesIds.push(item+'value');
        priceIds.push(item+'price');
        discounts.push(item+'discount');
        frieghts.push(item+'frieght');
    });
    errors=[]
    $.each(ids, function(i, id){
        if(document.getElementById(id).value && document.getElementById(id).value!="select"){
            document.getElementById(id).style.borderColor="grey";
        }
        else{errors.push(id)}
    });
    if(errors.length == 0){
        data={}
        tempIds=['no','date','delivery','customer']
        tempIds2=ids;
        // console.log(tempIds2)
        $.each(tempIds, function(i, id){
            data[id]=document.getElementById(id).value;
        });
        quantity=[]
        itemIds=[]
        itemPrices=[]
        itemDiscounts=[]
        frieght=[];
        // console.log(valuesIds)
        $.each(valuesIds, function(i, id){
            quantity.push(document.getElementById(id).value);
            itemPrices.push(document.getElementById(priceIds[i]).value);
            itemDiscounts.push(document.getElementById(discounts[i]).value);
            frieght.push(document.getElementById(frieghts[i]).value);
            temp=id.split("rfq");
            itemId=temp[0].replace("item","");
            itemIds.push(itemId);
        });
        data["quantity"]=quantity;
        data["items"]=itemIds;
        data["prices"]=itemPrices;
        data["discounts"]=itemDiscounts;
        data['frieght']=frieght;
        data["poId"]=localStorage.getItem("poId");
        postData=JSON.stringify(data)
        console.log(postData)
        var fd = new FormData();
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
        request=url+"/api/aviation/amendPO/"
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
            data:postData,
            success: function(data){
                // console.log(data);
                // window.location.href="pos.html";
                document.getElementById("successti").innerHTML=data["code"];
                document.getElementById("successAmount").innerHTML=data["amount"];
                document.getElementById("formBody").style.filter="blur(5px)";
                document.getElementById("ignismyModal").style.display="block";
                document.getElementById("ignismyModal").style.opacity="1";
                document.getElementById("poDocForm").action=url+"/api/aviation/uploadPODocument/"+data["code"];
                return false;
            }
        });}else{alert("Please Select File!");return false;}
    }
    else{
        $.each(errors, function(i, id){document.getElementById(id).style.borderColor="red"});
    }
}
function deleteRFQModal(param){
    localStorage.setItem("deleteRFQ",param.id);
    id=param.id;
    id=id.replace("deleteRFQ","");
    document.getElementById("rfqSGDDelete").innerHTML=id;
    document.getElementById("rfqDeleteModal").style.display="block";
    document.getElementById("rfqDeleteModal").style.opacity="1";
    document.getElementById("body").style.filter="blur(5px)";
}
function closeDeleteRFQModal(){
    document.getElementById("rfqDeleteModal").style.display="none";
    document.getElementById("rfqDeleteModal").style.opacity="0";
    document.getElementById("body").style.filter="blur(0px)";
}
function deleteRFQ(){
    id=localStorage.getItem("deleteRFQ");
    id=id.replace("deleteRFQ","");
    request=url+'/api/aviation/deleteRFQ/'+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            alert("RFQ Successfully Deleted!");
            location.reload();
        }
    });
}
function ss(){
    document.getElementById("formBody").style.filter="blur(5px)";
    document.getElementById("InleiusModal").style.display="block";
    document.getElementById("InleiusModal").style.opacity="1";
}
function createOC(param){
    localStorage.setItem("poId",param.id);
    window.location.href="addOCForm.html"
}
function ocFormItemRowHtml(item,count){
    html="<tr><td><input type='checkbox' id='item"+item.id+"' onclick='addItemToOC(this)'></td>"+
     " <td>"+count+"</td>"+
     " <td>"+item.partNo+"</td>"+
      "<td>"+item.nomenclature+"</td>"+
      '<td style="padding:0px;"><button id="inlieu'+item.id+'" onclick="addOCInLieuItem(this)">Add Item</button></td>'+
      '<td style="padding:0px;"><input style="background:lightgray;border:none;" id="date'+item.id+'"  type="date"></td>'+
      '<td style="padding:0px;"><input onkeyup="setOCFormDeliverDate(this)" type="number" placeholder="Enter" id="days'+item.id+'"></td>'+
      '<td style="padding:0px;"><input readonly style="background:lightgray;border:none;" id="delivery'+item.id+'"  type="date" value="'+item.deliveryPeriod+'"></td>'+
      '<td style="padding:0px;"><input onkeyup="calculateOCItemFormTotal(this)" type="number" placeholder="Enter" id="price'+item.id+'" value="'+item.price+'"></td>'+
      '<td style="padding:0px;"><input onkeyup="calculateOCItemFormTotal(this)" type="number" id="qty'+item.id+'" value="'+item.quantity+'" placeholder="Enter"></td>'+
      '<td style="padding:0px;"><input onkeyup="calculateOCItemFormTotal(this)" type="number"  id="discount'+item.id+'" value="'+item.discountPercent+'" placeholder="Enter"></td>'+
      '<td style="padding:0px;"><input onkeyup="calculateOCItemFormTotal(this)" type="number" id="frieght'+item.id+'" value="'+item.frieghtPercent+'" placeholder="Enter"></td>'+
      '<td><strong id="total'+item.id+'"></strong></td><tr>'+
      '<input style="dsplay:none;" type="text" id="inlieuValue'+item.id+'" value="-">'
    return html
}
ocFormItems=[]
function loadCreateOCForm(){
    id=localStorage.getItem("poId");
    id=id.replace("oc","");
    request=url+'/api/aviation/getPOItems/'+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            poDetails=data["poDetails"];
            document.getElementById("poNumber").innerHTML=poDetails["number"];
            document.getElementById("noItems").innerHTML=poDetails["noItems"]
            document.getElementById("poDate").innerHTML=poDetails["date"];
            document.getElementById("poAmount").innerHTML=poDetails["totalAmount"];
            document.getElementById("ocAmount").innerHTML=poDetails["totalAmount"];
            $row=$("#ocItems");
            $.each(data["items"], function(i,item){
                ocFormItems.push(item.id);
                html=ocFormItemRowHtml(item,i+1);
                $row.append(html);
                temp=setOCItemFormTotal(item.id);
            });
            setOCTotal();
        }
    });
}
function setOCTotal(){
    total=0
    $.each(ocFormItems,function(i,item){
        temp=document.getElementById("total"+item).innerHTML;
        total=parseFloat(total)+parseFloat(temp);
    });
    document.getElementById("ocAmount").innerHTML=total;
}
function setOCItemFormTotal(id){
    quantity=document.getElementById("qty"+id).value;
    price=document.getElementById("price"+id).value;
    discount=document.getElementById("discount"+id).value;
    frieght=document.getElementById("frieght"+id).value;
    temp=parseFloat(price)*parseFloat(quantity);
    temp2=temp-((parseFloat(discount)/100)*parseFloat(temp));
    temp3=temp2+((parseFloat(frieght)/100)*temp2);
    temp3=temp3.toFixed(2);
    document.getElementById("total"+id).innerHTML=temp3;
    return temp3
}
function calculateOCItemFormTotal(param){
    var id=param.id;
    id=id.replace("qty","");
    id=id.replace("price","");
    id=id.replace("discount","");
    id=id.replace("frieght","");
    id=id.replace("total","");
    setOCItemFormTotal(id);
    setOCTotal();
}
function setOCFormDeliverDate(param){
    id=param.id;
    id=id.replace("days","")
    var days = document.getElementById("days"+id).value;
    var date = new Date(document.getElementById("date"+id).value);
    date.setDate(date.getDate() + parseInt(days));  
    document.getElementById("delivery"+id).valueAsDate=date;
}
ocSelectedItem=[]
offerFormItemSelectStatus=false
function selectAllItemsOCForm(){
    $.each(ocFormItems,function(i,item){
        if(offerFormItemSelectStatus){
            document.getElementById("item"+item).checked=false;
            document.getElementById("offerFormItemSelectStatus").innerHTML="Select All";
        }
        else{
            document.getElementById("item"+item).checked=true;
            document.getElementById("offerFormItemSelectStatus").innerHTML="Unselect All";
        }
    });
    if(offerFormItemSelectStatus){
        ocSelectedItem=[];
        offerFormItemSelectStatus=false;
    }
    else{
        ocSelectedItem=ocFormItems;
        offerFormItemSelectStatus=true;
    }
}
function addItemToOC(param){
    id=param.id;
    id=id.replace("item","");
    const index = ocSelectedItem.indexOf(parseInt(id));
    if(index > -1){ocSelectedItem.splice(index, 1);}
    else{ocSelectedItem.push(parseInt(id));}
}
function addOC(){
    ids=["ocNumber","date"]
    postData={"ocNumber":"","date":""}
    itemFeatures=["date","delivery","price","qty","discount","frieght","days"]
    data={"date":[],"delivery":[],"price":[],"qty":[],"discount":[],"frieght":[],"days":[]}
    status1=true;
    status2=true;
    $.each(ids,function(i,item){
        temp=document.getElementById(item).value;
        if(temp){
            document.getElementById(item).style.borderColor="lightgrey";
            postData[item]=temp;
        }
        else{
            document.getElementById(item).style.border="1px solid";
            document.getElementById(item).style.borderColor="red";
            status1=false;
        }
    });
    if(status1==true){
        postData["ocAmount"]=document.getElementById("ocAmount").innerHTML;
        postData["poNumber"]=document.getElementById("poNumber").innerHTML;
        console.log(status1);
        $.each(ocSelectedItem,function(i,item){
            $.each(itemFeatures,function(j,item2){
                // console.log(item2+item)
                temp=document.getElementById(item2+item).value;
                data[item2].push(temp);
                if(temp){
                    document.getElementById(item2+item).style.borderColor="lightgrey";
                }
                else{
                    document.getElementById(item2+item).style.border="1px solid";
                    document.getElementById(item2+item).style.borderColor="red";
                    status2=false;
                }
            });
        });
        data.id=ocSelectedItem;
        if(status2==true){
            postData["items"]=data
            postData=JSON.stringify(postData)
            var fd = new FormData();
            var files = $('#attachDoc')[0].files;
            if(files.length > 0 ){
                request=url+"/api/aviation/addoc/"
                $.ajax({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    type: 'POST',
                    url: request,
                    // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
                    data:postData,
                    success: function(data){
                        if(data["response"]=="exist"){
                            document.getElementById("ocNumber").style.borderColor="red";
                            alert("Order Confirmation Number Already Exist!")
                        }
                        else{
                            document.getElementById("ocNumber").style.borderColor="lightgrey";
                            document.getElementById("successti").innerHTML=data["code"];
                            document.getElementById("ocNumberDisplay").innerHTML=data["ocNumber"];
                            document.getElementById("successAmount").innerHTML=data["ocAmount"];
                            document.getElementById("formBody").style.filter="blur(5px)";
                            document.getElementById("ignismyModal").style.display="block";
                            document.getElementById("ignismyModal").style.opacity="1";
                            document.getElementById("ocDocForm").action=url+"/api/aviation/uploadOCDocument/"+data["code"];
                            return false;
                        }
                    }
                });
            }
            else{
                alert("Please Select File!");
                return false;
            }
        }
        else{
            console.log("End")
            return false;
        }
    }
}
function submitOCDocument(){
    document.getElementById("ocDocForm").submit();
}
function editOC(param){
    localStorage.setItem("ocItemId",param.id);
    window.location.href="editOCForm.html";
}
function loadOCEdit(){
    console.log("access")
    id=localStorage.getItem("ocItemId");
    id=id.replace("edit","");
    request=url+"/api/aviation/getOCItemDetail/"+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            console.log(data);
            document.getElementById("ocNo").innerHTML="OC Number: "+data["response"]["ocNumber"];
            document.getElementById("poNo").innerHTML="PO Number: "+data["response"]["partNo"];
            document.getElementById("partNo").innerHTML="Part Number: "+data["response"]["poNumber"];
            document.getElementById("nomenclature").innerHTML="Nomenclature: "+data["response"]["nomenclature"];
            document.getElementById("date").value=data["response"]["date"];
            document.getElementById("validityDate").value=data["response"]["validity"];
            document.getElementById("unitPrice").value=data["response"]["price"];
            document.getElementById("qty").value=data["response"]["qunatity"];
            document.getElementById("ocDiscount").value=data["response"]["discountPercent"];
            document.getElementById("ocFrieghtCharges").value=data["response"]["frieghtPercent"];
            if(data["response"]["alternate"]=="-"){
                localStorage.setItem("OCInlieusStatus","false");
            }
            else{
                localStorage.setItem("OCInlieusStatus","true");
                document.getElementById("pn").innerHTML=data["response"]["alternate"];
                document.getElementById("qtyLieu").value=data["response"]["qunatity"];
                // document.getElementById("nomanclature").innerHTML=nomenclature;
                // document.getElementById("nsn").value=nsn;
                document.getElementById("inlieuItemButton").innerHTML="Edit Inlieu Item";
                document.getElementById("inlieuItemButton").style.background="rgb(88 124 47)";
            }

            getEditOCFormBom();
            return false;
        }
    });
}
function getEditOCFormBom(){
    id=localStorage.getItem("ocItemId");
    id=id.replace("edit","");
    request=url+"/api/aviation/getOCBOM/"+id;
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        success: function(data){
            console.log(data);
            localStorage.setItem("bom",JSON.stringify(data["response"]));
            var $items=$("#itemSets");
            $.each(data, function(i,item) {
                $.each(this, function(i, item){
                    $items.append("<option onclick='addOCInlieuItem()' value='"+item.partNo+"'>"+item.nomanclature+" | "+item.nsn+"</option>");
                });
            });
        }
    });
}
function addOCInlieuItem(partNo){
    localStorage.setItem("OCInlieusStatus","true");
    data=localStorage.getItem("bom");
    data=data.replace("[","");
    data=data.replace("]","");
    data=data.split("},");
    nomenclature="";
    nsn="";
    $.each(data, function(i, item){
        if(item.slice(-1)=="}"){}
        else{item=item+'}'}
        temp=JSON.parse(item);
         // console.log(String(temp.partNo)+"=="+String(partNo))
        if(String(temp.partNo)==String(partNo)){
            nomenclature=temp.nomanclature;
            nsn=temp.nsn;
        }
      else{}
    });
    document.getElementById("pn").innerHTML=partNo;
    document.getElementById("nomanclature").innerHTML=nomenclature;
    document.getElementById("nsn").value=nsn;
    document.getElementById("inlieuItemButton").innerHTML="Edit Inlieu Item";
    document.getElementById("inlieuItemButton").style.background="rgb(88 124 47)";
}
function inactiveOCInlieusModal(){
    if(document.getElementById("pn").innerHTML){
        if(document.getElementById("qtyLieu").value){
            localStorage.setItem("OCInlieusStatus","true");
            document.getElementById("formBody").style.filter="blur(0px)";
            document.getElementById("InleiusModal").style.display="none";
            document.getElementById("InleiusModal").style.opacity="0";
            document.getElementById("qtyDiv").style.display="none";
        }
        else{
            document.getElementById("qtyLieu").style.borderColor="red";
        }
    }
    else{}
}
function editOCSubmit(){
    console.log("access");
    id=localStorage.getItem("ocItemId");
    id=id.replace("edit","");
    console.log(id);
    ids=["date","validityDate","unitPrice","qty","ocDiscount","ocFrieghtCharges"]
    postData={"id":"","date":"","validityDate":"","unitPrice":"","qty":"","ocDiscount":"","ocFrieghtCharges":"","alternate":"-"}
    if(localStorage.getItem("OCInlieusStatus")=="true"){
        postData.alternate=document.getElementById("pn").innerHTML;
        console.log(document.getElementById("pn").innerHTML);
        document.getElementById("qty").value=document.getElementById("qtyLieu").value;
        document.getElementById(document.getElementById("qtyLieu").value);
    }
    else{
        postData.alternate="-";
    }
    status1=true;
    $.each(ids,function(i,item){
        temp=document.getElementById(item).value;
        if(temp){
            document.getElementById(item).borderColor="lightgrey";
            postData[item]=temp;
        }
        else{
            document.getElementById(item).borderColor="red";
            status1=false;
        }
    });
    if(status1==true){
        postData["id"]=id;
        postData=JSON.stringify(postData);
        console.log(postData)
        var fd = new FormData();
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
        request=url+"/api/aviation/editOrderConfirmation/"
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'POST',
            url: request,
            data:postData,
            success: function(data){
                console.log(data);
                temp1=document.getElementById("ocNo").innerHTML;
                temp2=document.getElementById("poNo").innerHTML;
                temp1=temp1.split(": ");
                temp2=temp2.split(": ");
                document.getElementById("successOCNumber").innerHTML=temp1[1];
                document.getElementById("successPartNo").innerHTML=temp2[1];
                document.getElementById("formBody").style.filter="blur(5px)";
                document.getElementById("ignismyModal").style.display="block";
                document.getElementById("ignismyModal").style.opacity="1";
                document.getElementById("ocEditDocForm").action=url+"/api/aviation/uploadOCEditDocument/"+data["code"];
                return false;
            }
        });
        }
        else{
            alert("Please Select File!");
            return false
        }
    }
    else{return false}
}
function submitOCEditDocument(){
    document.getElementById("ocEditDocForm").submit();
}
function loadShipment(){
    document.getElementById("department").innerHTML=localStorage.getItem("department").toUpperCase();
    const email=localStorage.getItem("email");
    let name=email.split("@");
    document.getElementById("user-name").innerHTML=name[0];
    let width = screen.width;
    if(width<=1600){
        let options=document.getElementById("menubar").innerHTML;
        document.getElementById("menubar").innerHTML="<button onclick='showMenubar()' style='box-shadow: none;border: none;'><img src='images/bars-solid.svg' height='30px'></button>";
        document.getElementById("menubarResponsive").innerHTML=options;
        document.getElementById("menubarResponsive").style.display="none";
        // document.getElementsByClassName("menubar").style.width="100%";
        document.getElementById("customer").style.display="none";
    }else{}
    loadPKL()
}
function enableItemShipmentDetailModel(){
    document.getElementById("itemShipmentDetailModel").style.display="block";
    document.getElementById("itemShipmentDetailModel").style.opacity="1";
}
function enableItemCommentDetailModel(){
    document.getElementById("itemCommentDetailModel").style.display="block";
    document.getElementById("itemCommentDetailModel").style.opacity="1";
}
function enableItemDamageDetailModel(){
    document.getElementById("itemDamageDetailModel").style.display="block";
    document.getElementById("itemDamageDetailModel").style.opacity="1";
}
function disableShipmentModals(){
    ids=["itemShipmentDetailModel","itemCommentDetailModel","itemDamageDetailModel"]
    $.each(ids,function(i,item){
        document.getElementById(item).style.display="none";
        document.getElementById(item).style.opacity="0";
    });
}
allPKLItems=[]
function loadCreatePKLForm(){
    allPKLItems=[]
}
function POOCItemHtml(item,count,total){
    html='<tr>'+
    '<td><input type="checkbox" id="item'+item.id+'" onclick="addItemtoPKL(this)"></td>'+
    '<td>'+count+'</td>'+
    ' <td>'+item.poNumber+'</td>'+
    ' <td>'+item.date+'</td>'+
    ' <td>'+item.validity+'</td>'+
    ' <td>'+item.partNo+'</td>'+
    ' <td>'+item.nomenclature+'</td>'+
    ' <td>'+item.alternate+'</td>'+
    '<td style="padding:0px;"><input type="text" id="sn'+item.id+'" style="background:white;border:none;" placeholder="Enter SN" ></td>'+
//    ' <td>'+item.price+'</td>'+
   ' <td id="rem'+item.id+'">'+item.qunatity+'</td>'+
   '<td><input type="number" id="qty'+item.id+'"></td>'+
//    ' <td>'+item.discountPercent+'</td>'+
//    ' <td>'+item.frieghtPercent+'</td>'+
//    '<td>'+total+'</td>'+
  '</tr>'
    return html
}
searchPOOCCount=1
searchPOOCPOs=[]
function searchPOOC(){
    search=document.getElementById("searchpooc").value;
    const index = searchPOOCPOs.indexOf(search);
    console.log(searchPOOCPOs);
    if(index > -1){alert("PO items already added!");}
    else{
        if(search){
        request=url+"/api/aviation/getPOAllOCItems/"+search
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                console.log(data);
                if(data["response"]=="not found"){
                    document.getElementById("searchpooc").style.borderColor="red";
                    alert("PO not found. Please enter correct PO number to add items!");
                }
                else{
                    searchPOOCPOs.push(search);
                    document.getElementById("searchpooc").style.borderColor="lightgrey";
                    $row=$("#plItems");
                    $.each(data["response"],function(i,item){
                        totalUnitPrice=parseFloat(item.price)*parseInt(item.qunatity)
                        console.log("UP",totalUnitPrice);
                        discountedPrice=(parseFloat(item.discountPercent)/100)*totalUnitPrice
                        console.log("DP",discountedPrice);
                        totalDiscountedPrice=totalUnitPrice-discountedPrice
                        console.log("TDP",totalDiscountedPrice);
                        totalPrice=totalDiscountedPrice+((parseFloat(item.frieghtPercent)/100)*totalDiscountedPrice)
                        console.log(totalPrice);
                        html=POOCItemHtml(item,searchPOOCCount,totalPrice.toFixed(2))
                        $row.append(html);
                        searchPOOCCount+=1;
                        allPKLItems.push(item.id)
                    });
                }
                
            }
        });
        }
        else{
            document.getElementById("searchpooc").style.borderColor="red";
        }
    }
}
selectedPKLItems=[]
pklFormItemSelectStatus=false
function selectALLPKLItems(){
    $.each(allPKLItems,function(i,item){
        if(pklFormItemSelectStatus){
            document.getElementById("item"+item).checked=false;
            document.getElementById("pklFormItemSelectStatus").innerHTML="Select All";
        }
        else{
            document.getElementById("item"+item).checked=true;
            document.getElementById("pklFormItemSelectStatus").innerHTML="Unselect All";
        }
    });
    if(pklFormItemSelectStatus){
        selectedPKLItems=[];
        pklFormItemSelectStatus=false;
    }
    else{
        selectedPKLItems=allPKLItems;
        pklFormItemSelectStatus=true;
    }
    console.log(selectedPKLItems);
}
function addItemtoPKL(param){
    id=param.id;
    id=id.replace("item","");
    const index = selectedPKLItems.indexOf(parseInt(id));
    if(index > -1){selectedPKLItems.splice(index, 1);}
    else{selectedPKLItems.push(parseInt(id));}
    console.log(selectedPKLItems);
}
function addPKL(){
    console.log(selectedPKLItems.length)
    data={}
    if(selectedPKLItems.length===0){
        alert("PLease add item to create PKL!");
        return false;
    }
    else{
        ids=["pklNumber","date","shipmentDate"]
        tempStatus=true;
        $.each(ids,function(i,item){
            if(document.getElementById(item).value){
                document.getElementById(item).style.borderColor="lightgrey";
                data[item]=document.getElementById(item).value;
            }
            else{
                document.getElementById(item).style.borderColor="red";
                tempStatus=false;
            }
        });
        sn=[]
        qty=[]
        $.each(selectedPKLItems,function(i,item){
            if(document.getElementById("sn"+item).value){
                document.getElementById("sn"+item).style.borderColor="lightgrey";
                sn.push(document.getElementById("sn"+item).value);
            }
            else{
                document.getElementById("sn"+item).style.border="1px solid";
                document.getElementById("sn"+item).style.borderColor="red";
                tempStatus=false;
            }
            if(document.getElementById("qty"+item).value){
                if(parseInt(document.getElementById("qty"+item).value) > 0 && parseInt(document.getElementById("qty"+item).value) <= parseInt(document.getElementById("rem"+item).innerHTML)){
                    document.getElementById("qty"+item).style.borderColor="lightgrey";
                    qty.push(document.getElementById("qty"+item).value);
                    console.log(document.getElementById("qty"+item).value," Approve");
                }
                else{
                    document.getElementById("qty"+item).style.border="1px solid";
                    document.getElementById("qty"+item).style.borderColor="red";
                    document.getElementById("rem"+item).style.background="#ffeb3b73";
                    tempStatus=false;
                    console.log(document.getElementById("qty"+item).value," ",document.getElementById("rem"+item).innerHTML,"Not Approve");

                }
            }
            else{
                document.getElementById("qty"+item).style.border="1px solid";
                document.getElementById("qty"+item).style.borderColor="red";
                tempStatus=false;
            }
        });
        if(tempStatus){
            data["items"]=selectedPKLItems;
            data["sn"]=sn;
            data["qty"]=qty;
            postData=JSON.stringify(data)
            var fd = new FormData();
            var files = $('#attachDoc')[0].files;
            if(files.length > 0 ){
                request=url+"/api/aviation/addPKL/"
                $.ajax({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    type: 'POST',
                    url: request,
                    // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
                    data:postData,
                    success: function(data){
                        if(data["response"]=="exist"){
                            document.getElementById("ocNumber").style.borderColor="red";
                            alert("PKL Number Already Exist!")
                        }
                        else{
                            document.getElementById("pklNumber").style.borderColor="lightgrey";
                            document.getElementById("successti").innerHTML=data["code"];
                            document.getElementById("pklNumberDisplay").innerHTML=data["pklNumber"];
                            document.getElementById("pos").innerHTML=data["pos"];
                            document.getElementById("formBody").style.filter="blur(5px)";
                            document.getElementById("ignismyModal").style.display="block";
                            document.getElementById("ignismyModal").style.opacity="1";
                            document.getElementById("pklDocForm").action=url+"/api/aviation/uploadPKLDocument/"+data["code"];
                            return false;
                        }
                    }
                });
            }
            else{
                alert("Please Select File!");
                return false;
            }

        }
        else{}
    }
}
function submitPKLDocument(){
    document.getElementById("pklDocForm").submit();
}
function pklItemsHTML(item){
    html=' <tr>'+
    ' <td>'+item.reference+'</td>'+  
        ' <td>'+item.partNumber+'</td>'+
    '  <td>'+item.nomenclature+'</td>'+
    '  <td>'+item.serialNumber+'</td>'+
    '  <td>'+item.qtyRem+'</td>'+
    '  <td>'+item.qtyPro+'</td>'+
        ' <td>'+item.damage+'</td>'+
        ' <td>'+item.missing+'</td>'+
        '<td>'+item.comment+'</td>'+
    '  <td>'+item.status+'</td>'+
    '</tr>'
     return html
}
function pklHTML(items,data){
    console.log(items);
    itemHTML=""
    $.each(items,function(i,item){
        itemHTML=itemHTML+pklItemsHTML(item);
    })
    html='<div class="shipment">'+
    '<div class="shipmentCardDiv">'+
            '<div>PKL No: '+data.number+'</div>'+
            '<div>PKL Date: '+data.date+'</div>'+
            '<div>Shipment Date: '+data.shipmentDate+'</div>'+
            '<div onclick="invoiceDetails(this)" style="cursor:pointer;">Invoice Number: '+data.invoiceNumber+'</div>'+
            '<div>AWB Number: '+data.AWB+'</div>'+
            '<div onclick="crvDetails(this)" style="cursor:pointer;">CRV Number: '+data.CRV+'</div>'+
    '</div>'+
   ' <div class="offersTableSection">'+
        '<table class="offersTable">'+
            '<tr style="background:#183A69;color:white;font-weight:700;">'+
            '<th>PO Number</th>'+
                '<th>Part No</th>'+
                '<th>Nomenclature</th>'+
                '<th>Serial No</th>'+
                 '<th>Qty Rem</th>'+
                '<th>Qty Dispatch</th>'+
                ' <th>Dmg Qty</th>'+
               ' <th>Msg Qty</th>'+
                '<th>Comment</th>'+
                '<th>Delivery Status</th>'+
           ' </tr>'+
           itemHTML+
            '</table>'+
            '</div>'+
            '<div class="remarkSection">'+
            ' <button class="requestStatus">Status</button>'+
            '</div>'+
        '</div>'
        return html
}
function loadPKL(){
    request=url+"/api/getAllPKL/"
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
        success: function(data){
            console.log(data);
            response=data["response"];
            $pkl=$("#pkls");
            $.each(response,function(i,item){
                items=item["items"];
                html=pklHTML(items,item);
                $pkl.append(html);
            });
        }
    });
}
function loadInvoiceForm(){
    request=url+"/api/getAllPKLNamess/"
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
        success: function(data){
            console.log(data);
            response=data["response"];
            console.log(response)
            $row=$("#packingList");
            $.each(response,function(i,item){
                console.log(item)
                html="<option onclick='addPKLItems(this)' value='"+item+"'></option>";
                console.log(html)
                $row.append(html)
            });
        }
    });
}
function invoiceItemHTML(item,count,total){
    html='<tr id="row'+item.id+'">'+
    '<td>'+count+'</td>'+
    ' <td>'+item.plNumber+'</td>'+
    ' <td>'+item.serialNumber+'</td>'+
    ' <td>'+item.partNumber+'</td>'+
    ' <td>'+item.nomenclature+'</td>'+
    ' <td id="qty'+item.id+'">'+item.qtyPro+'</td>'+
    '<td style="padding:0px;"><input type="number" id="price'+item.id+'" style="background:lightgray;border:none;" oninput="invoiceTotalCalculation()" value="'+item.price+'" placeholder="Enter Price" ></td>'+
    '<td style="padding:0px;"><input type="number" id="discount'+item.id+'" style="background:lightgray;border:none;" oninput="invoiceTotalCalculation()" value="'+item.discountPercent+'"  placeholder="Enter Discount" ></td>'+
    '<td style="padding:0px;"><input type="number" id="frieght'+item.id+'" style="background:lightgray;border:none;" oninput="invoiceTotalCalculation()" value="'+item.frieghtPercent+'"  placeholder="Enter Frieght" ></td>'+
   ' <td id="total'+item.id+'">'+total+'</td>'+
  '</tr>'
    return html
}
invoiceFormCount=1;
invoiceFormItems=[];
invoicePKLs=[]
invoicePKLsItems={}
function addPKLItems(search){
    const index = invoicePKLs.indexOf(search);
    if(index > -1){
        alert("PKL Already Exist!");
        document.getElementById("searchPackingList").value="";
    }
    else{
        console.log(search);
        invoicePKLs.push(search);
        invoicePKLsItems[search]=[];
        request=url+"/api/getPKLItems/"+search;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $row=$("#invoicetems");
                total=0;
                $pklTagContainer=$("#packingListsContainer")
                $pklTagContainer.append('<div id="tag'+search+'">'+search+'&nbsp;&nbsp;&nbsp;<img src="images/delete-left-solid.svg" id="tagRemove'+search+'" onclick="removePKLFromInvoice(this)" class="packingListRemoveTag"></div>');
                $.each(data["response"],function(i,item){
                    temp=parseInt(item.qtyPro)*parseFloat(item.price)
                    temp2=parseFloat(item.discount)*temp
                    temp3=temp-temp2
                    total=temp3+(parseFloat(item.frieghtPercent)*temp);
                    html=invoiceItemHTML(item,invoiceFormCount,total);
                    $row.append(html);
                    invoiceFormItems.push(item.id);
                    invoicePKLsItems[search].push(item.id);
                    invoiceFormCount+=1;
                });
                document.getElementById("searchPackingList").value="";
            }
        });
    }
}
function removePKLFromInvoice(param){
    id=param.id;
    id=id.replace("tagRemove","");
    items=invoicePKLsItems[id];
    const index0 = invoicePKLs.indexOf(id);
    if (index0 > -1) {
        invoicePKLs.splice(index0, 1);
    }
    $.each(items,function(i,item){
        const index = invoiceFormItems.indexOf(item);
        if (index > -1) {
            invoiceFormItems.splice(index, 1);
            document.getElementById("row"+item).remove();
        }
        else{}
    });
    document.getElementById("tag"+id).remove();
}
function invoiceTotalCalculation(){
    $.each(invoiceFormItems,function(i,item){
        console.log(item)
        price=parseFloat(document.getElementById("price"+item).value);
        quantity=parseFloat(document.getElementById("qty"+item).innerHTML);
        frieght=parseFloat(document.getElementById("frieght"+item).value);
        discount=parseFloat(document.getElementById("discount"+item).value);
        temp=quantity*price
        console.log(temp)
        temp2=parseFloat(discount/100)*temp
        temp3=temp-temp2
        total=temp3+(parseFloat(frieght/100)*temp);
        document.getElementById("total"+item).innerHTML=total;
    });
}
function addInvoice(){
    data={"prices":[],"discounts":[],"frieghts":[]}
    if(invoiceFormItems.length===0){alert("Please Add Invoice Item");}
    else{
    ids=["invoiceNumber","pjtNumber","invoiceDate"];
    tempStatus=true
    $.each(ids,function(i,item){
        if(document.getElementById(item).value){
            document.getElementById(item).style.display="lightgrey"
            data[item]=document.getElementById(item).value;
        }
        else{
            document.getElementById(item).style.border="1px solid";
            document.getElementById(item).style.borderColor="red";
            tempStatus=false;
        }
    });
    if(tempStatus==true){
        tempStatus2=true;
        hyperParam=["price","frieght","discount"];
        $.each(invoiceFormItems,function(i,item){
            $.each(hyperParam,function(j,item2){
                if(document.getElementById(item2+item).value && document.getElementById(item2+item).value>-1){
                    document.getElementById(item2+item).style.borderColor="lightgrey";
                    data[item2+"s"].push(document.getElementById(item2+item).value);
                }
                else{
                    document.getElementById(item2+item).style.border="1px solid";
                    document.getElementById(item2+item).style.borderColor="red";
                    tempStatus2=false;
                }
            })
        });
        if(tempStatus2){
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
            data["items"]=invoiceFormItems;
            postData=JSON.stringify(data);
            request=url+"/api/aviation/addInvoice/";
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                data:postData,
                success: function(data){
                    if(data["response"]=="exist"){
                        alert("Invoice Number Already Exist");
                        document.getElementById("invoiceNumber").style.borderColor="red";
                    }
                    else{
                        document.getElementById("invoiceNumber").style.borderColor="lightgrey";
                        document.getElementById("successti").innerHTML=data["code"];
                        document.getElementById("invoiceNumberDisplay").innerHTML=data["invoiceNumber"];
                        document.getElementById("pjt").innerHTML=data["pjtNumber"];
                        document.getElementById("formBody").style.filter="blur(5px)";
                        document.getElementById("ignismyModal").style.display="block";
                        document.getElementById("ignismyModal").style.opacity="1";
                        document.getElementById("invoiceDocForm").action=url+"/api/aviation/uploadInvoiceDocument/"+data["code"];
                    }
                }
            });
        }else{alert("Please Select File!")}
    }else{}
    }else{}
    }
}
function submitInvoiceDocument(){
    document.getElementById("invoiceDocForm").submit();
}
function loadAWBForm(){
    request=url+"/api/aviation/getAllPKLNamesAWB/"
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
        success: function(data){
            console.log(data);
            response=data["response"];
            console.log(response)
            $row=$("#packingList");
            $.each(response,function(i,item){
                console.log(item)
                html="<option onclick='addPKLItems(this)' value='"+item+"'></option>";
                console.log(html)
                $row.append(html)
            });
        }
    });
}
awbPKLs=[];
function removePKLFromAWB(param){
    id=param.id;
    id=id.replace("tagRemove","");
    items=invoicePKLsItems[id];
    const index0 = invoicePKLs.indexOf(id);
    if (index0 > -1) {
        invoicePKLs.splice(index0, 1);
    }
    document.getElementById("tag"+id).remove();
}
function addAWBPKL(search){
    console.log(awbPKLs);
    const index = awbPKLs.indexOf(search);
    if(index > -1){
        alert("PKL Already Exist!");
    }
    else{
        $pklTagContainer=$("#awbListsContainer");
        $pklTagContainer.append('<div id="tag'+search+'">'+search+'&nbsp;&nbsp;&nbsp;<img src="images/delete-left-solid.svg" id="tagRemove'+search+'" onclick="removePKLFromAWB(this)" class="packingListRemoveTag"></div>');
        awbPKLs.push(search);
    }
    document.getElementById("searchPackingList").value="";
}
function addAWB(){
    data={}
    if(awbPKLs.length===0){alert("Please Add AWB Item");}
    else{
        ids=["awbNumber","awbDate"]
        tempStatus=true
        $.each(ids,function(i,item){
            if(document.getElementById(item).value){
                data[item]=document.getElementById(item).value;
                document.getElementById(item).style.borderColor="lightgrey";
            }
            else{
                document.getElementById(item).style.border="1px solid";
                document.getElementById(item).style.borderColor="red";
                tempStatus=false;
            }
        });
        if(tempStatus){
            var files = $('#attachDoc')[0].files;
            if(files.length > 0 ){
                data["items"]=awbPKLs;
                postData=JSON.stringify(data);
                request=url+"/api/aviation/addAWB/";
                $.ajax({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    type: 'POST',
                    url: request,
                    data:postData,
                    success: function(data){
                        if(data["response"]=="exist"){
                            alert("AWB Number Already Exist");
                            document.getElementById("awbNumber").style.borderColor="red";
                        }
                        else{
                            document.getElementById("awbNumber").style.borderColor="lightgrey";
                            document.getElementById("successti").innerHTML=data["code"];
                            document.getElementById("awbNumberDisplay").innerHTML=data["awbNumber"];
                            document.getElementById("formBody").style.filter="blur(5px)";
                            document.getElementById("ignismyModal").style.display="block";
                            document.getElementById("ignismyModal").style.opacity="1";
                            document.getElementById("awbDocForm").action=url+"/api/aviation/uploadAWBDocument/"+data["code"];
                        }
                    }
                })
            }else{alert("Please Select File!")}
        }
    }
}
function submitAWBDocument(){
    document.getElementById("awbDocForm").submit();
}
function loadCRVForm(){
    request=url+"/api/aviation/getAllInvoiceNames/"
    $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        type: 'GET',
        url: request,
        // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
        success: function(data){
            console.log(data);
            response=data["response"];
            console.log(response)
            $row=$("#invoiceList");
            $.each(response,function(i,item){
                console.log(item)
                html="<option onclick='addCRVItems(this)' value='"+item+"'></option>";
                console.log(html)
                $row.append(html)
            });
        }
    });
}
function addCRVItems(param){
    
}
function invoiceItemHTML(item,count,total){
    html='<tr id="row'+item.id+'">'+
    '<td>'+count+'</td>'+
    ' <td>'+item.plNumber+'</td>'+
    ' <td>'+item.serialNumber+'</td>'+
    ' <td>'+item.partNumber+'</td>'+
    ' <td>'+item.nomenclature+'</td>'+
    ' <td id="qty'+item.id+'">'+item.qtyPro+'</td>'+
    '<td style="padding:0px;"><input type="number" id="price'+item.id+'" style="background:lightgray;border:none;" oninput="invoiceTotalCalculation()" value="'+item.price+'" placeholder="Enter Price" ></td>'+
    '<td style="padding:0px;"><input type="number" id="discount'+item.id+'" style="background:lightgray;border:none;" oninput="invoiceTotalCalculation()" value="'+item.discountPercent+'"  placeholder="Enter Discount" ></td>'+
    '<td style="padding:0px;"><input type="number" id="frieght'+item.id+'" style="background:lightgray;border:none;" oninput="invoiceTotalCalculation()" value="'+item.frieghtPercent+'"  placeholder="Enter Frieght" ></td>'+
   ' <td id="total'+item.id+'">'+total+'</td>'+
  '</tr>'
    return html
}
invoiceFormCount=1;
invoiceFormItems=[];
invoicePKLs=[]
invoicePKLsItems={}
function addPKLItems(search){
    const index = invoicePKLs.indexOf(search);
    if(index > -1){
        alert("PKL Already Exist!");
        document.getElementById("searchPackingList").value="";
    }
    else{
        console.log(search);
        invoicePKLs.push(search);
        invoicePKLsItems[search]=[];
        request=url+"/api/getPKLItems/"+search;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $row=$("#invoicetems");
                total=0;
                $pklTagContainer=$("#packingListsContainer")
                $pklTagContainer.append('<div id="tag'+search+'">'+search+'&nbsp;&nbsp;&nbsp;<img src="images/delete-left-solid.svg" id="tagRemove'+search+'" onclick="removePKLFromInvoice(this)" class="packingListRemoveTag"></div>');
                $.each(data["response"],function(i,item){
                    temp=parseInt(item.qtyPro)*parseFloat(item.price)
                    temp2=parseFloat(item.discount)*temp
                    temp3=temp-temp2
                    total=temp3+(parseFloat(item.frieghtPercent)*temp);
                    html=invoiceItemHTML(item,invoiceFormCount,total);
                    $row.append(html);
                    invoiceFormItems.push(item.id);
                    invoicePKLsItems[search].push(item.id);
                    invoiceFormCount+=1;
                });
                document.getElementById("searchPackingList").value="";
            }
        });
    }
}
function removePKLFromInvoice(param){
    id=param.id;
    id=id.replace("tagRemove","");
    items=invoicePKLsItems[id];
    const index0 = invoicePKLs.indexOf(id);
    if (index0 > -1) {
        invoicePKLs.splice(index0, 1);
    }
    $.each(items,function(i,item){
        const index = invoiceFormItems.indexOf(item);
        if (index > -1) {
            invoiceFormItems.splice(index, 1);
            document.getElementById("row"+item).remove();
        }
        else{}
    });
    document.getElementById("tag"+id).remove();
}
function crvItemHTML(item,count){
    html='<tr id="row'+item.id+'">'+
    '<td>'+count+'</td>'+
    ' <td>'+item.invoiceNumber+'</td>'+
    ' <td>'+item.poNumber+'</td>'+
    ' <td>'+item.sn+'</td>'+
    ' <td>'+item.partNumber+'</td>'+
    ' <td>'+item.nomenclature+'</td>'+
    ' <td>'+item.inlieu+'</td>'+
    ' <td>'+item.qty+'</td>'+
    '<td style="padding:0px;"><input type="number" id="damage'+item.id+'" style="background:lightgray;border:none;" value="0" placeholder="Enter Missing Quantity" ></td>'+
    '<td style="padding:0px;"><input type="number" id="missing'+item.id+'" style="background:lightgray;border:none;" value="0"  placeholder="Enter Damage Quantity" ></td>'+
    '<td style="padding:0px;"><textarea type="text" id="comment'+item.id+'" style="background:lightgray;border:none;" value="-"  placeholder="Enter Comment"></textarea></td>'+
  '</tr>'
    return html
}

crvFormCount=1;
crvFormItems=[];
crvInvoice=[]
crvInvoiceItems={}
crvFormCount=1

function addCRVItems(search){
    const index = crvInvoice.indexOf(search);
    if(index > -1){
        alert("Invoice Already Exist!");
        document.getElementById("searchInvoiceList").value="";
    }
    else{
        console.log(search);
        crvInvoice.push(search);
        crvInvoiceItems[search]=[]
        request=url+"/api/aviation/getInvoiceItems/"+search;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            success: function(data){
                $row=$("#crvitems");
                total=0;
                $pklTagContainer=$("#crvListsContainer")
                console.log(data)
                $pklTagContainer.append('<div id="tag'+search+'">'+search+'&nbsp;&nbsp;&nbsp;<img src="images/delete-left-solid.svg" id="tagRemove'+search+'" onclick="removeInvoiceFromCRV(this)" class="packingListRemoveTag"></div>');
                $.each(data["response"],function(i,item){
                    html=crvItemHTML(item,crvFormCount);
                    console.log(html);
                    $row.append(html);
                    crvFormItems.push(item.id);
                    crvInvoiceItems[search].push(item.id);
                    crvFormCount+=1;
                });
                document.getElementById("searchInvoiceList").value="";
            }
        });
    }
}

function removeInvoiceFromCRV(param){
    id=param.id;
    id=id.replace("tagRemove","");
    items=crvInvoiceItems[id];
    const index0 = crvInvoice.indexOf(id);
    if (index0 > -1) {
        crvInvoice.splice(index0, 1);
    }
    $.each(items,function(i,item){
        const index = crvFormItems.indexOf(item);
        if (index > -1) {
            crvFormItems.splice(index, 1);
            document.getElementById("row"+item).remove();
        }
        else{}
    });
    document.getElementById("tag"+id).remove();
}
function addCRV(){
    data={"damage":[],"missing":[],"comment":[]}
    if(crvFormItems.length===0){alert("Please Add CRV Item");}
    else{
    ids=["crvNumber","crvDate"];
    tempStatus=true
    $.each(ids,function(i,item){
        if(document.getElementById(item).value){
            document.getElementById(item).style.display="lightgrey"
            data[item]=document.getElementById(item).value;
        }
        else{
            document.getElementById(item).style.border="1px solid";
            document.getElementById(item).style.borderColor="red";
            tempStatus=false;
        }
    });
    if(tempStatus==true){
        tempStatus2=true;
        hyperParam=["damage","missing","comment"];
        $.each(crvFormItems,function(i,item){
            $.each(hyperParam,function(j,item2){
                if(document.getElementById(item2+item).value){
                    document.getElementById(item2+item).style.borderColor="lightgrey";
                    data[item2].push(document.getElementById(item2+item).value);
                }
                else{
                    document.getElementById(item2+item).style.border="1px solid";
                    document.getElementById(item2+item).style.borderColor="red";
                    tempStatus2=false;
                }
            })
        });
        if(tempStatus2){
        var files = $('#attachDoc')[0].files;
        if(files.length > 0 ){
            data["items"]=crvFormItems;
            console.log(data);
            postData=JSON.stringify(data);
            request=url+"/api/aviation/addCRV/";
            $.ajax({
                headers: {
                    'Content-Type': 'application/json'
                },
                type: 'POST',
                url: request,
                data:postData,
                success: function(data){
                    if(data["response"]=="exist"){
                        alert("CRV Number Already Exist");
                        document.getElementById("crvNumber").style.borderColor="red";
                    }
                    else{
                        document.getElementById("crvNumber").style.borderColor="lightgrey";
                        document.getElementById("successti").innerHTML=data["code"];
                        document.getElementById("crvNumberDisplay").innerHTML=data["crvNumber"];
                        document.getElementById("formBody").style.filter="blur(5px)";
                        document.getElementById("ignismyModal").style.display="block";
                        document.getElementById("ignismyModal").style.opacity="1";
                        document.getElementById("crvDocForm").action=url+"/api/aviation/uploadCRVDocument/"+data["code"];
                    }
                }
            });
        }else{alert("Please Select File!")}
    }else{}
    }else{}
    }
}
function submitCRVDocument(){
    document.getElementById("crvDocForm").submit();
}
function selectOCItemDates(){
    date=document.getElementById("date").value;
    $.each(ocFormItems,function(i,item){
        document.getElementById("date"+item).value=date;
        if(document.getElementById("days"+item).value){
            var days = document.getElementById("days"+item).value;
            var endDate = new Date(document.getElementById("date"+item).value);
            endDate.setDate(endDate.getDate() + parseInt(days));  
            document.getElementById("delivery"+item).valueAsDate=endDate;
        }
        else{document.getElementById("delivery"+item).value=date;}
    });
}
function searchPKL(){
    search=document.getElementById("searchPKL").value;
    document.getElementById("pkls").innerHTML="";
    if(search){
        request=url+"/api/searchPKL/"+search;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
            success: function(data){
                console.log(data);
                response=data["response"];
                $pkl=$("#pkls");
                $.each(response,function(i,item){
                    items=item["items"];
                    html=pklHTML(items,item);
                    $pkl.append(html);
                });
            }
        });
    }
    else{
        loadPKL();
    }
}
function invoiceDetails(param){
    invoice=param.innerHTML;
    invoice=invoice.replace("Invoice Number: ","");
    document.getElementById("detailsModal").style.display="block";
    document.getElementById("detailsModal").style.opacity="1";
    document.getElementById("body").style.filter="blur(5px)";
    document.getElementById("details").innerHTML="";
    document.getElementById("detailsTable").innerHTML="";
    request=url+"/api/getInvoiceDetails/"+invoice;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
            success: function(data){
                console.log(data);
                for(var key in data["invoice"]){
                    if(key=="fileLoc"){
                        $("#details").append("<div>"+key+"</div><div><a href='"+data["invoice"][key]+"'><button style='border:none'>Download</button></a></div>")
                    }
                    else{
                    $("#details").append("<div>"+key+"</div><div>"+data["invoice"][key]+"</div>")
                    }
                }
                $("#detailsTable").append("<tr><th>S.No</th> <th>invoiceNumber</th> <th>sn</th> <th>partNumber</th> <th>nomenclature</th> <th>inlieu</th> <th>qty</th> <th>price</th> <th>discount</th> <th>frieght</th> <th>PKL Number</th></tr>");
                $.each(data["items"],function(i,item){
                    html="";
                    for(var key in item){
                        html=html+"<td>"+item[key]+"</td>";
                    }
                    $("#detailsTable").append("<tr>"+html+"</tr>");
                });
            }
        });
}
function crvDetails(param){
    crv=param.innerHTML;
    crv=crv.replace("CRV Number: ","");
    document.getElementById("detailsModal").style.display="block";
    document.getElementById("detailsModal").style.opacity="1";
    document.getElementById("body").style.filter="blur(5px)";
    document.getElementById("details").innerHTML="";
    document.getElementById("detailsTable").innerHTML="";
    request=url+"/api/getCRVDetails/"+crv;
        $.ajax({
            headers: {
                'Content-Type': 'application/json'
            },
            type: 'GET',
            url: request,
            // url : 'http://127.0.0.1:8081/api/allusers/'+'20',
            success: function(data){
                console.log(data);
                for(var key in data["crv"]){
                    if(key=="fileLoc"){
                        $("#details").append("<div>"+key+"</div><div><a href='"+data["crv"][key]+"'><button style='border:none'>Download</button></a></div>")
                    }
                    else{
                    $("#details").append("<div>"+key+"</div><div>"+data["crv"][key]+"</div>")
                    }
                }
                $("#detailsTable").append("<tr><th>id</th><th>serialNumber</th><th>partNumber</th><th>nomenclature</th><th>inlieu</th><th>qty</th><th>crvNumber</th><th>damageQuantity</th><th>missingQuantity</th><th>comment</th><th>refference</th></tr>");
                $.each(data["items"],function(i,item){
                    html="";
                    for(var key in item){
                        html=html+"<td>"+item[key]+"</td>";
                    }
                    $("#detailsTable").append("<tr>"+html+"</tr>");
                });
            }
        });
}
function disableDetailModal(){
    document.getElementById("detailsModal").style.display="none";
    document.getElementById("detailsModal").style.opacity="0";
    document.getElementById("body").style.filter="blur(0px)";
}