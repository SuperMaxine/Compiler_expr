while (a3+15)>0xa do if x2 = 07 then while y<z do y = x * y / z; c=b*c+d;

; = { } > < + - * / ( ) IDN INT8 INT10 INT16 IF THEN ELSE WHILE DO

S->IDN = E
S->IF C THEN S
S->IF C THEN S ELSE S
S->WHILE C DO S
S->{ P }
P->L
P->L P
L->S ;
C->E > E
C->E < E
C->E = E
E->E + T
E->E - T
E->T
T->F
T->T * F
T->T / F
F->( E )
F->IDN
F->INT8
F->INT10
F->INT16

S'->S
(para_arr,vm)=>{
  return {type:"S'",place:para_arr[0]["place"], code:para_arr[0]["code"],children:para_arr};
  }

S->IDN = E
(para_arr,vm)=>{
  return {type:"S", code:para_arr[2]["code"]+para_arr[0]["attribute"]+":="+para_arr[2]["place"]+"\n",children:para_arr};
  }

S->IF C THEN S
(para_arr,vm)=>{
  return {type:"S", code:para_arr[1]["code"]+para_arr[1]["true"]+":"+para_arr[3]["code"]+para_arr[1]["false"]+":",children:para_arr};
  }

S->IF C THEN S ELSE S
(para_arr,vm)=>{
  let next = "label"+(++vm.labelNum)
  return {type:"S", code:para_arr[1]["code"]+para_arr[1]["true"]+":"+para_arr[3]["code"]+"goto "+next+"\n"+para_arr[1]["false"]+":"+para_arr[5]["code"]+next+":",children:para_arr};
  }

S->WHILE C DO S
(para_arr,vm)=>{
  let begin = "label"+(++vm.labelNum)
  return {type:"S", code:begin+":"+para_arr[1]["code"]+para_arr[1]["true"]+":"+para_arr[3]["code"]+"goto "+begin+"\n"+para_arr[1]["false"]+":",children:para_arr};
  }
  
S->{ P }
(para_arr,vm)=>{
  return {type:"S", code:para_arr[1]["code"],children:para_arr};
  }

P->L
(para_arr,vm)=>{
  return {type:"P", code:para_arr[0]["code"],children:para_arr};
  }

P->L P
(para_arr,vm)=>{
  return {type:"P", code:para_arr[0]["code"]+para_arr[1]["code"],children:para_arr};
  }

L->S ;
(para_arr,vm)=>{
  return {type:"L", code:para_arr[0]["code"],children:para_arr};
  }

C->E > E
(para_arr,vm)=>{
  let t="label"+(++vm.labelNum)
  let f="label"+(++vm.labelNum)
  return {type:"C",true:t,false:f, code:para_arr[0]["code"]+para_arr[2]["code"]+"if "+para_arr[0]["place"]+">"+para_arr[2]["place"]+" goto "+t+"\n"+"goto "+f+"\n",children:para_arr};
  }

C->E < E
(para_arr,vm)=>{
  let t="label"+(++vm.labelNum)
  let f="label"+(++vm.labelNum)
  return {type:"C",true:t,false:f, code:para_arr[0]["code"]+para_arr[2]["code"]+"if "+para_arr[0]["place"]+"<"+para_arr[2]["place"]+" goto "+t+"\n"+"goto "+f+"\n",children:para_arr};
  }

C->E = E
(para_arr,vm)=>{
  let t="label"+(++vm.labelNum)
  let f="label"+(++vm.labelNum)
  return {type:"C",true:t,false:f, code:para_arr[0]["code"]+para_arr[2]["code"]+"if "+para_arr[0]["place"]+"="+para_arr[2]["place"]+" goto "+t+"\n"+"goto "+f+"\n",children:para_arr};
  }

E->E + T
(para_arr,vm)=>{
  vm.placeNum++;
  let newtemp="tmp"+vm.placeNum
  return {type:"E",place:newtemp, code:para_arr[0]["code"]+para_arr[2]["code"]+newtemp+":="+para_arr[0]["place"]+"+"+para_arr[2]["place"]+"\n",children:para_arr};
  }

E->E - T
(para_arr,vm)=>{
  vm.placeNum++;
  let newtemp="tmp"+vm.placeNum
  return {type:"E",place:newtemp, code:para_arr[0]["code"]+para_arr[2]["code"]+newtemp+":="+para_arr[0]["place"]+"-"+para_arr[2]["place"]+"\n",children:para_arr};
  }

E->T
(para_arr,vm)=>{
  return {type:"E",place:para_arr[0]["place"], code:para_arr[0]["code"],children:para_arr};
  }

T->F
(para_arr,vm)=>{
  return {type:"T",place:para_arr[0]["place"], code:para_arr[0]["code"],children:para_arr};
  }

T->T * F
(para_arr,vm)=>{
  vm.placeNum++;
  let newtemp="tmp"+vm.placeNum
  return {type:"T",place:newtemp, code:para_arr[0]["code"]+para_arr[2]["code"]+newtemp+":="+para_arr[0]["place"]+"*"+para_arr[2]["place"]+"\n",children:para_arr};
  }

T->T / F
(para_arr,vm)=>{
  vm.placeNum++;
  let newtemp="tmp"+vm.placeNum
  return {type:"T",place:newtemp, code:para_arr[0]["code"]+para_arr[2]["code"]+newtemp+":="+para_arr[0]["place"]+"/"+para_arr[2]["place"]+"\n",children:para_arr};
  }

F->( E )
(para_arr,vm)=>{
  return {type:"F",place:para_arr[1]["place"], code:para_arr[1]["code"],children:para_arr};
  }

F->IDN
(para_arr,vm)=>{
  return {type:"F",place:para_arr[0]["attribute"], code:"",children:para_arr};
  }

F->INT8
(para_arr,vm)=>{
  return {type:"F",place:para_arr[0]["attribute"], code:"",children:para_arr};
  }

F->INT10
(para_arr,vm)=>{
  return {type:"F",place:para_arr[0]["attribute"], code:"",children:para_arr};
  }
  
F->INT16
(para_arr,vm)=>{
  return {type:"F",place:para_arr[0]["attribute"], code:"",children:para_arr};
  }
