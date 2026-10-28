import { useState, useEffect } from 'react';
import api from '../../../lib/api';

// Portal de Acesso no mesmo endereço (Nginx): informa quem está logado e encerra a sessão de todos os sistemas
const PORTAL_EU = '/acesso/api/eu';
const PORTAL_SAIR = '/acesso/api/sair';

export function useAuth() {
    const [crachaAtivo, setCrachaAtivo] = useState(localStorage.getItem('cracha_ativo'));
    const [nomeOperador, setNomeOperador] = useState(localStorage.getItem('nome_operador') || '');
    const [verificandoPortal, setVerificandoPortal] = useState(true);

    const login = async (numeroCracha) => {
        try {
            const response = await api.get(`/portaria/login/${numeroCracha}`);
            if (response.data && response.data.usuario) {
                const nomeCompleto = response.data.usuario.nome_completo;
                localStorage.setItem('cracha_ativo', numeroCracha);
                localStorage.setItem('nome_operador', nomeCompleto);
                setCrachaAtivo(numeroCracha);
                setNomeOperador(nomeCompleto);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro no login', error);
            throw error;
        }
    };

    const limparOperador = () => {
        localStorage.removeItem('cracha_ativo');
        localStorage.removeItem('nome_operador');
        setCrachaAtivo(null);
        setNomeOperador('');
    };

    // Login único: o operador é sempre quem entrou no Portal. Se o Portal mudou de pessoa (troca de turno)
    // e o novo login não for um crachá válido, o crachá anterior é descartado e a tela de crachá aparece.
    useEffect(() => {
        let cancelado = false;
        (async () => {
            try {
                const resposta = await fetch(PORTAL_EU, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
                if (!resposta.ok) return;
                const eu = await resposta.json();
                const crachaPortal = String(eu?.usuario || '').trim();
                if (!crachaPortal || crachaPortal === localStorage.getItem('cracha_ativo')) return;
                try {
                    if (!cancelado) await login(crachaPortal);
                } catch {
                    if (!cancelado) limparOperador();
                }
            } catch {
                // Sem Portal (ex.: desenvolvimento): segue com o login por crachá
            } finally {
                if (!cancelado) setVerificandoPortal(false);
            }
        })();
        return () => { cancelado = true; };
    }, []); // só ao abrir o sistema

    // Sair encerra também o login do Portal; senão o login único entraria de novo na mesma hora
    const logout = async () => {
        limparOperador();
        try {
            const resposta = await fetch(PORTAL_SAIR, { method: 'POST', credentials: 'same-origin', headers: { 'X-Portal': '1' } });
            if (resposta.ok) {
                window.location.href = `/acesso/entrar?volta=${encodeURIComponent(window.location.pathname)}`;
            }
        } catch {
            // Sem Portal: a tela de crachá já aparece
        }
    };

    return { crachaAtivo, nomeOperador, verificandoPortal, login, logout };
}
