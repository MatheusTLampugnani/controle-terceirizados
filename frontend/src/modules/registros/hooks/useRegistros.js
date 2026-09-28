import { useState, useCallback } from 'react';
import api from '../../../lib/api';

export function useRegistros() {
    const [abaAtiva, setAbaAtiva] = useState('pendentes');
    const [pendentes, setPendentes] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');
    const [itensSelecionados, setItensSelecionados] = useState([]);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        try {
            const rota = abaAtiva === 'pendentes' ? '/portaria/pendentes' : '/portaria/historico';
            const response = await api.get(rota);

            let dadosValidados = [];
            if (Array.isArray(response.data)) {
                dadosValidados = response.data;
            } else if (response.data && Array.isArray(response.data.dados)) {
                dadosValidados = response.data.dados;
            }

            if (abaAtiva === 'pendentes') {
                setPendentes(dadosValidados);
            } else {
                setHistorico(dadosValidados);
            }
            setItensSelecionados([]);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            if (abaAtiva === 'pendentes') setPendentes([]);
            else setHistorico([]);
        } finally {
            setLoading(false);
        }
    }, [abaAtiva]);

    const listaAtual = abaAtiva === 'pendentes' ? pendentes : historico;

    const listaFiltrada = listaAtual.filter((item) => {
        const busca = termoBusca.toLowerCase();
        const equipamento = item.equipamento_descricao?.toLowerCase() || '';
        const pessoa = item.pessoas_terceiras?.nome?.toLowerCase() || '';
        const empresa = item.pessoas_terceiras?.empresas_terceiras?.nome?.toLowerCase() || '';
        const serie = item.numero_serie?.toLowerCase() || '';
        return equipamento.includes(busca) || pessoa.includes(busca) || empresa.includes(busca) || serie.includes(busca);
    });

    const toggleSelecaoItem = (item) => {
        const jaSelecionado = itensSelecionados.some(i => i.id === item.id);
        if (jaSelecionado) {
            setItensSelecionados(itensSelecionados.filter(i => i.id !== item.id));
        } else {
            setItensSelecionados([...itensSelecionados, item]);
        }
    };

    const toggleSelecionarTodos = (lista) => {
        if (itensSelecionados.length === lista.length && lista.length > 0) {
            setItensSelecionados([]);
        } else {
            setItensSelecionados([...lista]);
        }
    };

    return {
        abaAtiva, setAbaAtiva,
        pendentes, historico,
        loading,
        termoBusca, setTermoBusca,
        itensSelecionados, setItensSelecionados,
        carregarDados,
        listaFiltrada,
        toggleSelecaoItem, toggleSelecionarTodos
    };
}
