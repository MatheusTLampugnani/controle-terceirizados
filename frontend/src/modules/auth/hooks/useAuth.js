import { useState } from 'react';
import api from '../../../lib/api';

export function useAuth() {
    const [crachaAtivo, setCrachaAtivo] = useState(localStorage.getItem('cracha_ativo'));
    const [nomeOperador, setNomeOperador] = useState(localStorage.getItem('nome_operador') || '');

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

    const logout = () => {
        localStorage.removeItem('cracha_ativo');
        localStorage.removeItem('nome_operador');
        setCrachaAtivo(null);
        setNomeOperador('');
    };

    return { crachaAtivo, nomeOperador, login, logout };
}
