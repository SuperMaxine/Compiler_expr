3*(2-1)

+ - * / ( ) INT10

S->E
E->E + T
E->E - T
E->T
T->T * F
T->T / F
T->F
F->INT10
F->( E )


S'->S
(para_arr,vm)=>{
return {type:"S'",place:para_arr[0]["place"], code:para_arr[0]["code"],children:para_arr};
}

S->E
(para_arr,vm)=>{
return {type:"S",place:para_arr[0]["place"], code:para_arr[0]["code"],children:para_arr};
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

T->F
(para_arr,vm)=>{
return {type:"T",place:para_arr[0]["place"], code:para_arr[0]["code"],children:para_arr};
}

F->INT10
(para_arr,vm)=>{
return {type:"F",place:para_arr[0]["attribute"], code:"",children:para_arr};
}

F->( E )
(para_arr,vm)=>{
return {type:"F",place:para_arr[1]["place"], code:para_arr[1]["code"],children:para_arr};
}
