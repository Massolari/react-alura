import React, { Component } from 'react';
import InputCustomizado from './componentes/InputCustomizado';
import SelectCustomizado from './componentes/SelectCustomizado';
import { addLivro, getLivros, deleteLivro, getAutores } from './persistence';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

class FormularioLivro extends Component {

    constructor() {
        super();
        const autores = getAutores();
        const semAutor = { id: 0, desc: 'Selecione um autor...' };
        this.stateLimpo = {
            titulo: '',
            preco: '',
            autor: semAutor.id,
            autores: [semAutor].concat(autores)
        };
        this.state = Object.assign({}, this.stateLimpo);
        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutor = this.setAutor.bind(this);
    }

    enviaForm(evento){
        evento.preventDefault();
        const { titulo, preco, autor } = this.state;
        const livro = { titulo, preco, autor };
        PubSub.publish("limpa-erros",{});
        try {
            const novaLista = addLivro(livro);
            PubSub.publish('atualiza-lista-livros', novaLista);
            this.setState(this.stateLimpo);
        } catch (e) {
            const erros = JSON.parse(e.message);
            new TratadorErros().publicaErros(erros);
        }
    }

    setTitulo(evento){
        this.setState({ titulo: evento.target.value });
    }

    setPreco(evento){
        this.setState({ preco: evento.target.value });
    }

    setAutor(evento){
        this.setState({ autor: Number(evento.target.value) });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Título"/>
                    <InputCustomizado id="preco" type="number" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço"/>
                    <SelectCustomizado id="autor" label="Autor" name="autor" value={this.state.autor} options={this.state.autores.map(a => ({ desc: a.nome, ...a }))} onChange={this.setAutor}></SelectCustomizado>
                    <div className="pure-control-group">
                        <label></label>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>

            </div>

        );
    }
}

class TabelaLivros extends Component {

    render() {
        return(
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Preço</th>
                            <th>Autor</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map((livro) => {
                                return (
                                    <tr key={livro.id}>
                                        <td>{livro.titulo}</td>
                                        <td>{livro.preco}</td>
                                        <td>{livro.autor.nome}</td>
                                        <td><button onClick={() => this.props.onDeletarLivro(livro.id)}>X</button></td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = {
            lista: []
        };
        this.deletarLivro = this.deletarLivro.bind(this);
    }

    componentDidMount(){
        const livros = getLivros();
        if (!livros) {
            console.error('Erro ao pegar livros');
            return;
        }
        this.setState({
            lista: livros
        })

        PubSub.subscribe('atualiza-lista-livros', (topico,novaLista) => {
            this.setState({ lista: novaLista });
        });
    }

    deletarLivro(livroId) {
        try {
            const novaLista = deleteLivro(livroId);
            this.setState({
                lista: novaLista
            });
        } catch(e) {
            console.error(e);
        }
    }


    render(){
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro />
                    <TabelaLivros lista={this.state.lista} onDeletarLivro={this.deletarLivro}/>
                </div>

            </div>
        );
    }
}

