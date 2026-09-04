require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));


const PORTA = process.env.PORTA || process.env.PORT || 3000;
const dbUser = process.env.MONGODB_USERNAME;
const dbPass = process.env.MONGODB_PASSWORD;
const dbUri = process.env.MONGODB_URI;


mongoose.connect(dbUri)
    .then(()=>console.log("Banco de Dados Conectado."))
    .catch((erro)=> console.log("Erro crítico na conexão:",erro))


const AgendamentoSchema = new mongoose.Schema({
    jogador: {type: String,required: true},
    quantidadeDePessoas: {type: Number,required: true},
    bolaAlugada: {type:Boolean,required: false},
    quadra: {type:Number,required:true},
    dataAluguel: {type: Date},
    horario: {type:Date,default:Date.now}
})
const Agendamento = mongoose.model('Agendamento', AgendamentoSchema)
//CREATE : CRUDE -> C
app.post('/agendar',async (req,res)=>{
    try{
        const dadosRecebidos = req.body;
        const novoAgendamento = new Agendamento({
            jogador: dadosRecebidos.jogador,
            quantidadeDePessoas: dadosRecebidos.quantidadeDePessoas,
            bolaAlugada: dadosRecebidos.bolaAlugada,
            quadra: dadosRecebidos.quadra,
            dataAluguel: dadosRecebidos.dataAluguel,
            horario: dadosRecebidos.horario
        })
        await novoAgendamento.save();
        res.status(201).json({
            mensagem:"Quadra garantida com sucesso!",
            dados: novoAgendamento
        });
    } catch(erro){
        console.error("Erro ao agendar:", erro.message);
        res.status(500).json({erro:"Falha ao gravar no BD."})
    }
})
//Read -> CRUD -> R
app.get('/agendamentos',async(req,res)=>{
    try{
        const listaDeQuadras = await Agendamento.find({})
        res.status(200).json(listaDeQuadras);
    } catch(erro){
        res.status(500).json({erro:"Erro ao buscar os dados."})
    }
})
app.get('/agendamentos/:id',async(req,res)=>{
    try{
        const agendamento = await Agendamento.findById(req.params.id);
        if(!agendamento){
            return res.status(404).json({erro:"Reserva não encontrada."});
        }
        res.status(200).json(agendamento);
    } catch(erro){
        res.status(500).json({erro:"Erro ao buscar a reserva."})
    }
})
//Update -> CRUD -> U
app.put('/agendamentos/:id',async(req,res)=>{
    try{
        const agendamentoAtualizado = await Agendamento.findByIdAndUpdate(
            req.params.id,
            {
                jogador: req.body.jogador,
                quantidadeDePessoas: req.body.quantidadeDePessoas,
                bolaAlugada: req.body.bolaAlugada,
                quadra: req.body.quadra,
                dataAluguel: req.body.dataAluguel
            },
            { new: true, runValidators: true }
        );
        if(!agendamentoAtualizado){
            return res.status(404).json({erro:"Reserva não encontrada."});
        }
        res.status(200).json({mensagem:"Reserva atualizada com sucesso!", dados: agendamentoAtualizado});
    } catch(erro){
        console.error("Erro ao atualizar reserva:", erro.message);
        res.status(500).json({erro:"Falha ao atualizar a reserva."});
    }
})
app.listen(PORTA,()=>{
    console.log(`Arena de Quadras liberada Porta:${PORTA}`);
})
app.delete('/agendamentos/:id',async(req,res)=>{
    try{
        const agendamentoCancelado = await Agendamento.findByIdAndDelete(req.params.id);
        if(!agendamentoCancelado){
            return res.status(404).json({erro:"Reserva não encontrada."});
        }
        res.status(200).json({mensagem:"Reserva cancelada com sucesso!"});
    } catch(erro){
        res.status(500).json({erro:"Falha ao tentar cancelar a reserva."});
    }
})
app.listen(PORTA,()=>{
    console.log(`Arena de Quadras liberada Porta:${PORTA}`);
})


