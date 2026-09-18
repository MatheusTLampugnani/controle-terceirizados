export const getOperadorAtual = () => {
    const cracha = localStorage.getItem('cracha_ativo');
    let nome = localStorage.getItem('nome_operador');

    if (!nome || nome === 'null' || nome === 'undefined') {
        nome = 'Operador';
    }

    const nomeFormatado = cracha ? `${nome} - ${cracha}` : nome;

    return {
        cracha,
        nome: nomeFormatado
    };
};