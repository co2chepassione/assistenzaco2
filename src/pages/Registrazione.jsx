import { useState } from "react";
import { supabase } from "../supabase";
import Campo from "../components/Campo";
import SelectCampo from "../components/SelectCampo";
import Card from "../components/Card";

const TIPI=["CO2","Fibra","UV","MOPA","Altro"];
const PIANI=["300x200","400x400","500x300","600x400","700x500","900x600","1000x800","1300x900","1600x1000","1300x2500","Altro"];
const POTENZE=["50W","60W","80W","100W","130W","150W","180W","300W","Altro"];
const CONTROLLER=["Ruida","Trocen","TopWisdom","Leetro","RichAuto","Altro"];

const iniziale={nome:"",cognome:"",telefono:"",email:"",indirizzo:"",citta:"",provincia:"",cap:"",marca:"",tipo:"",modello:"",piano_lavoro:"",potenza:"",controller:"",note:""};

export default function Registrazione(){
 const [form,setForm]=useState(iniziale);
 const [loading,setLoading]=useState(false);
 const [errore,setErrore]=useState("");
 const [ok,setOk]=useState(false);

 const cambia=e=>setForm({...form,[e.target.name]:e.target.value});

 async function registra(e){
   e.preventDefault();
   setErrore("");
   if(!form.nome||!form.cognome||!form.telefono||!form.indirizzo||!form.citta){
      setErrore("Compila Nome, Cognome, Telefono, Indirizzo e Città.");
      return;
   }
   if(form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)){
      setErrore("Email non valida.");
      return;
   }
   const cifre=form.telefono.replace(/\D/g,"");
   if(cifre.length<8){
      setErrore("Telefono non valido.");
      return;
   }
   setLoading(true);

   let q=supabase.from("clienti").select("id").or(
     `telefono.eq.${form.telefono}${form.email?`,email.eq.${form.email}`:""}`
   ).limit(1);
   const {data}=await q;
   if(data && data.length){
      setLoading(false);
      setErrore("Esiste già un cliente con questi dati.");
      return;
   }

   const {error}=await supabase.from("clienti").insert([{...form,stato:"Attivo",data_installazione:new Date().toISOString().slice(0,10)}]);
   setLoading(false);
   if(error){setErrore(error.message);return;}
   setOk(true);
 }

 if(ok){
   return <div style={{minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"center",background:"linear-gradient(#f8fafc,#eef2ff)",padding:20}}>
     <Card><div style={{textAlign:"center"}}>
      <img src="/logo.png" alt="Logo" style={{width:380,maxWidth:"95%",marginBottom:20}}/>
      <h1>✅ Registrazione completata</h1>
      <p>Grazie! I dati sono stati registrati correttamente.</p>
     </div></Card>
   </div>;
 }

 const grid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20};

 return <div style={{background:"linear-gradient(#f8fafc,#eef2ff)",minHeight:"100vh",padding:"20px 20px 40px"}}>
  <form onSubmit={registra} style={{maxWidth:980,margin:"0 auto"}}>
   <div style={{textAlign:"center",marginBottom:25}}>
    <img src="/logo.png" alt="Logo" style={{width:420,maxWidth:"95%",display:"block",margin:"0 auto 10px"}}/>
    <h1 style={{fontSize:40,fontWeight:600,margin:"8px 0"}}>Portale Registrazione Cliente</h1>
    <p style={{color:"#6b7280"}}>Compila il modulo per registrare la tua macchina.</p>
   </div>
   {errore && <div style={{background:"#fee2e2",padding:12,borderRadius:8,marginBottom:20}}>{errore}</div>}
   <Card icon="👤" title="Dati Cliente"><div style={grid}>
    <Campo label="Nome *" name="nome" value={form.nome} onChange={cambia}/>
    <Campo label="Cognome *" name="cognome" value={form.cognome} onChange={cambia}/>
    <Campo label="Telefono *" name="telefono" value={form.telefono} onChange={cambia}/>
    <Campo label="Email" name="email" type="email" value={form.email} onChange={cambia}/>
    <Campo label="Indirizzo *" name="indirizzo" value={form.indirizzo} onChange={cambia}/>
    <Campo label="Città *" name="citta" value={form.citta} onChange={cambia}/>
    <Campo label="Provincia" name="provincia" value={form.provincia} onChange={cambia}/>
    <Campo label="CAP" name="cap" value={form.cap} onChange={cambia}/>
   </div></Card>
   <Card icon="🖨" title="Dati Macchina (facoltativi)"><div style={grid}>
    <Campo label="Marca" name="marca" value={form.marca} onChange={cambia}/>
    <Campo label="Modello" name="modello" value={form.modello} onChange={cambia}/>
    <SelectCampo label="Tipo" name="tipo" value={form.tipo} onChange={cambia} options={TIPI}/>
    <SelectCampo label="Piano di lavoro" name="piano_lavoro" value={form.piano_lavoro} onChange={cambia} options={PIANI}/>
    <SelectCampo label="Potenza" name="potenza" value={form.potenza} onChange={cambia} options={POTENZE}/>
    <SelectCampo label="Controller" name="controller" value={form.controller} onChange={cambia} options={CONTROLLER}/>
   </div></Card>
   <Card icon="📝" title="Note">
    <textarea name="note" value={form.note} onChange={cambia} rows={5} style={{width:"100%",padding:14,border:"1px solid #d1d5db",borderRadius:8,boxSizing:"border-box"}}/>
   </Card>
   <button type="submit" disabled={loading} style={{width:"100%",padding:16,border:0,borderRadius:10,background:"#1d4ed8",color:"#fff",fontWeight:"bold",fontSize:17}}>
    {loading?"Registrazione in corso...":"✓ REGISTRA CLIENTE"}
   </button>
  </form>
 </div>;
}
