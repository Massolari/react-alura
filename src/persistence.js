const getList = (name) => {
    const elementsStr = localStorage.getItem(name);
    if (!elementsStr) {
        return [];
    }
    try {
        const elements = JSON.parse(elementsStr);
        return elements;
    } catch (e) {
        return [];
    }
};

const validarObjeto = (objeto, campos) => {
    const erros = campos.reduce((erros, c) => {
        if (!Boolean(String.prototype.trim.bind(objeto[c])())) {
            erros.push({
                field: c,
                defaultMessage: 'may not be empty'
            });
        }
        return erros;
    }, []);
    if (erros.length > 0) {
        throw new Error(JSON.stringify(erros));
    }
};

const addObject = (object, list, name) => {
    const id = getBiggerId(list) + 1;
    list.push({ id, ...object });
    localStorage.setItem(name, JSON.stringify(list));
    return list;
};

const deleteObject = (id, name) => {
    const list = getList(name);
    const deleteIndex = list.findIndex(e => e.id === id);
    if (deleteIndex === -1) {
        throw new Error("Objeto para deleção não encontrado!");
    }
    list.splice(deleteIndex, 1);
    localStorage.setItem(name, JSON.stringify(list));
    return list;
};

const validarAutor = (autor) => validarObjeto(autor, [ 'nome', 'email', 'senha' ]);

const validarLivro = (livro) => validarObjeto(livro, [ 'nome' ]);

const getBiggerId = (list) => list.reduce((bigger, { id }) => (id > bigger) ? id : bigger, 0);

export const getAutores = () => getList('autores');

export const addAutor = (autor) => {
    validarAutor(autor);
    const autores = getAutores();
    return addObject(autor, autores, 'autores');
};

export const deleteAutor = (id) => deleteObject(id, 'autores');

export const getLivros = () => getList('livros');

export const addLivro = (livro) => {
    validarLivro(livro);
    const livros = getLivros();
    return addObject(livro, livros, 'livros');
};

export const deleteLivro = (id) => deleteObject(id, 'livros');
