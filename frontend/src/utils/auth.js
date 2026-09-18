export const getOperadorAtual = () => {
    const cracha = localStorage.getItem('cracha_ativo');
    const nome = localStorage.getItem('nome_operador') || (cracha ? `Crachá ${cracha}` : 'Operador Portaria');

    return {
        cracha,
        nome
    };
};