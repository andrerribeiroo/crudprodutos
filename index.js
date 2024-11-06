const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let produtos = [];
let produtoIndex = 1;

// Rota para criar um novo produto
app.post('/produtos', (req, res) => {
    const { nome, quantidade, preco } = req.body;

    // Validação
    if (produtos.some(produto => produto.nome === nome)) {
        return res.status(400).json({ message: 'Produto com esse nome já existe.' });
    }
    if (quantidade <= 0 || preco <= 0) {
        return res.status(400).json({ message: 'Quantidade e preço devem ser positivos.' });
    }

    const novoProduto = { id: produtoIndex++, nome, quantidade, preco };
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

// Listar todos os produtos
app.get('/produtos', (req, res) => {
    res.json(produtos);
});

// Rota para buscar produto por nome
app.get('/produtos/buscar', (req, res) => {
    const nome = req.query.nome;

    if (!nome) {
        return res.status(400).json({ message: 'O parâmetro "nome" é obrigatório.' });
    }

    // Busca produtos que contêm o nome especificado (ignora maiúsculas/minúsculas)
    const produtosEncontrados = produtos.filter(produto => 
        produto.nome.toLowerCase().includes(nome.toLowerCase())
    );

    if (produtosEncontrados.length > 0) {
        res.json(produtosEncontrados);
    } else {
        res.status(404).json({ message: 'Nenhum produto encontrado com esse nome.' });
    }
});


// Rota para atualizar um produto
app.put('/produtos/:id', (req, res) => {
    const produtoId = parseInt(req.params.id);
    const { nome, quantidade, preco } = req.body;

    const produto = produtos.find(p => p.id === produtoId);

    if (produto) {
        // Validações para evitar duplicidade e garantir valores positivos
        if (nome != null && nome !== produto.nome && produtos.some(p => p.nome === nome)) {
            return res.status(400).json({ message: 'Produto com esse nome já existe.' });
        }
        if (quantidade != null && quantidade <= 0) {
            return res.status(400).json({ message: 'Quantidade deve ser positiva.' });
        }
        if (preco != null && preco <= 0) {
            return res.status(400).json({ message: 'Preço deve ser positivo.' });
        }

        // Atualiza apenas os campos alterados
        if (nome != null && nome !== produto.nome) {
            produto.nome = nome;
        }
        if (quantidade != null && quantidade !== produto.quantidade) {
            produto.quantidade = quantidade;
        }
        if (preco != null && preco !== produto.preco) {
            produto.preco = preco;
        }

        res.json(produto);
    } else {
        res.status(404).json({ message: 'Produto não encontrado' });
    }
});


app.delete('/produtos/:id', (req, res) => {
    const produtoId = parseInt(req.params.id);
    const index = produtos.findIndex(p => p.id === produtoId);

    if (index !== -1) {
        const produtoRemovido = produtos.splice(index, 1);
        res.json({ message: 'Produto removido com sucesso', produto: produtoRemovido });
    } else {
        res.status(404).json({ message: 'Produto não encontrado' });
    }
});

// Rota para gerar relatório de estoque
app.get('/relatorio', (req, res) => {
    const totalProdutos = produtos.length;
    const valorTotalEstoque = produtos.reduce((total, produto) => total + (produto.quantidade * produto.preco), 0);

    res.json({
        totalProdutos,
        valorTotalEstoque
    });
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
