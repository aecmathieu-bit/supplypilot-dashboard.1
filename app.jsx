
import React, { useState, useMemo, useContext, createContext, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

/* =========================
   STATIC DATA
========================= */

const FAMILLES = [
"Électrique","Consommables","Hydraulique","MRO",
"Mécanique","Packaging","Quincaillerie","Sécurité"
];

const SUPPLIERS = [
{ id:1,name:"Nordic Parts",active:true,delay:12,conformity:96,late:4,email:"contact@nordic.com"},
{ id:2,name:"Atlas Supply",active:true,delay:9,conformity:92,late:7,email:"sales@atlas.com"},
{ id:3,name:"Quantum Industrial",active:true,delay:14,conformity:90,late:10,email:"contact@quantum.com"},
{ id:4,name:"SteelWorks Global",active:true,delay:18,conformity:87,late:12,email:"sales@steelworks.com"},
{ id:5,name:"PackFlow Ltd.",active:false,delay:15,conformity:88,late:15,email:"info@packflow.com"},
];

/* =========================
   ITEM GENERATION
========================= */

function generateItems(seed=42,count=400){

let rand=seed
function random(){
rand=(rand*9301+49297)%233280
return rand/233280
}

const words1=["Max","Nano","Smart","Flex","Premium","Industrial","Ultra","Pro","Core","Titan"]
const words2=["Coupling","Filter","Bolt","Fuse","Sensor","Valve","Relay","Pump","Bearing","Label","Switch","Motor","Gasket","Clamp","Tube"]

let items=[]

for(let i=1;i<=count;i++){

let demand=Math.floor(1000+random()*19000)
let cost=10+random()*490
let orderCost=10+random()*90
let holdRate=[0.18,0.2,0.25,0.28,0.3][Math.floor(random()*5)]
let lead=Math.floor(2+random()*30)
let safety=Math.floor(20+random()*780)
let stock=Math.floor(random()*1200)

let H=cost*holdRate
let EOQ=Math.sqrt((2*demand*orderCost)/H)
let ROP=(demand/365*lead)+safety

items.push({
sku:"SKU-"+String(i).padStart(4,"0"),
name:words1[Math.floor(random()*words1.length)]+" "+words2[Math.floor(random()*words2.length)]+" "+Math.floor(random()*900+100),
family:FAMILLES[Math.floor(random()*FAMILLES.length)],
demand,
cost:cost.toFixed(2),
EOQ:Math.round(EOQ),
ROP:Math.round(ROP),
stock
})

}

return items
}

const ITEMS=generateItems()

/* =========================
   THEMES
========================= */

const THEMES={

dark:{
background:"#0B0F1A",
surface:"#111827",
card:"#1A2035",
accent:"#10B981",
text:"#ffffff"
},

light:{
background:"#F3F4F8",
surface:"#ffffff",
card:"#ffffff",
accent:"#059669",
text:"#111"
}

}

/* =========================
   CONTEXTS
========================= */

const ThemeContext=createContext()
const DataContext=createContext()

function useTheme(){return useContext(ThemeContext)}
function useData(){return useContext(DataContext)}

/* =========================
   UI COMPONENTS
========================= */

function Card({title,children}){

const {theme}=useTheme()

return(
<div style={{
background:theme.card,
padding:20,
borderRadius:16,
marginBottom:20
}}>

<div style={{fontWeight:700,marginBottom:10}}>{title}</div>

{children}

</div>
)
}

function KpiCard({label,value}){

const {theme}=useTheme()

return(
<div style={{
background:theme.card,
padding:20,
borderRadius:16,
minWidth:180
}}>
<div style={{fontSize:12,opacity:.6}}>{label}</div>
<div style={{fontSize:28,fontWeight:700}}>{value}</div>
</div>
)
}

/* =========================
   SORT HOOK
========================= */

function useSortable(data){

const [sortCol,setSortCol]=useState(null)
const [sortDir,setSortDir]=useState("desc")

const handleSort=(col)=>{

if(col===sortCol){
setSortDir(sortDir==="desc"?"asc":"desc")
}else{
setSortCol(col)
setSortDir("desc")
}

}

const sorted=useMemo(()=>{

if(!sortCol)return data

return [...data].sort((a,b)=>{

if(a[sortCol]<b[sortCol]) return sortDir==="asc"?-1:1
if(a[sortCol]>b[sortCol]) return sortDir==="asc"?1:-1
return 0

})

},[data,sortCol,sortDir])

return{sorted,handleSort,sortCol,sortDir}
}

/* =========================
   PAGES
========================= */

function Dashboard(){

const {items}=useData()

const avgEOQ=useMemo(()=>{
return Math.round(items.reduce((a,b)=>a+b.EOQ,0)/items.length)
},[items])

const data=items.slice(0,12).map(i=>({
name:i.sku,
EOQ:i.EOQ
}))

return(

<div>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
gap:20,
marginBottom:30
}}>

<KpiCard label="Articles actifs" value={items.length}/>
<KpiCard label="EOQ moyen" value={avgEOQ}/>

</div>

<Card title="Distribution EOQ">

<div style={{height:300}}>

<ResponsiveContainer>

<BarChart data={data}>

<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>

<Bar dataKey="EOQ"/>

</BarChart>

</ResponsiveContainer>

</div>

</Card>

</div>

)

}

/* =========================
   INVENTORY PAGE
========================= */

function Inventory(){

const {items}=useData()

const {sorted,handleSort}=useSortable(items)

return(

<Card title="Inventaire">

<div style={{overflowX:"auto"}}>

<table style={{width:"100%",fontSize:13}}>

<thead>

<tr>

<th onClick={()=>handleSort("sku")}>SKU</th>
<th onClick={()=>handleSort("name")}>Article</th>
<th onClick={()=>handleSort("family")}>Famille</th>
<th onClick={()=>handleSort("demand")}>Demande</th>
<th onClick={()=>handleSort("EOQ")}>EOQ</th>
<th onClick={()=>handleSort("ROP")}>ROP</th>
<th onClick={()=>handleSort("stock")}>Stock</th>

</tr>

</thead>

<tbody>

{sorted.slice(0,50).map(i=>(

<tr key={i.sku}>

<td>{i.sku}</td>
<td>{i.name}</td>
<td>{i.family}</td>
<td>{i.demand}</td>
<td>{i.EOQ}</td>
<td>{i.ROP}</td>
<td>{i.stock}</td>

</tr>

))}

</tbody>

</table>

</div>

</Card>

)

}

/* =========================
   SUPPLIERS PAGE
========================= */

function Suppliers(){

return(

<Card title="Fournisseurs">

<table style={{width:"100%",fontSize:13}}>

<thead>

<tr>
<th>Nom</th>
<th>Délai</th>
<th>Conformité</th>
<th>Email</th>
</tr>

</thead>

<tbody>

{SUPPLIERS.map(s=>(

<tr key={s.id}>

<td>{s.name}</td>
<td>{s.delay} j</td>
<td>{s.conformity}%</td>
<td>{s.email}</td>

</tr>

))}

</tbody>

</table>

</Card>

)

}

/* =========================
   NAVIGATION
========================= */

const PAGES={
dashboard:"Dashboard",
inventory:"Inventaire",
suppliers:"Fournisseurs"
}

/* =========================
   APP
========================= */

export default function App(){

const [mode,setMode]=useState("dark")
const [page,setPage]=useState("dashboard")

const theme=THEMES[mode]

const data={
items:ITEMS
}

const PageComponent=
page==="dashboard"?Dashboard:
page==="inventory"?Inventory:
Suppliers

return(

<ThemeContext.Provider value={{theme,mode,setMode}}>
<DataContext.Provider value={data}>

<div style={{
background:theme.background,
color:theme.text,
minHeight:"100vh",
display:"flex",
fontFamily:"DM Sans"
}}>

{/* SIDEBAR */}

<div style={{
width:220,
background:theme.surface,
padding:20
}}>

<h2>SupplyPilot</h2>

{Object.entries(PAGES).map(([key,label])=>(

<div
key={key}
onClick={()=>setPage(key)}
style={{
cursor:"pointer",
padding:"10px 0",
color:page===key?theme.accent:theme.text
}}
>

{label}

</div>

))}

<button
onClick={()=>setMode(mode==="dark"?"light":"dark")}
style={{marginTop:20}}
>
Toggle theme
</button>

</div>

{/* MAIN */}

<div style={{flex:1,padding:30}}>

<PageComponent/>

</div>

</div>

</DataContext.Provider>
</ThemeContext.Provider>

)

}
