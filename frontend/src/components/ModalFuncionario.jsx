import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../services/api';

export default function ModalFuncionario({ show, handleClose, onFuncionarioSalvo }) {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        empresa_id: '',
        nome: '',
        documento: ''
    });

    // Busca a lista de empresas assim que o modal abre
    useEffect(() => {
        if (show) {
            carregarEmpresas();
        }
    }, [show]);

    const carregarEmpresas = async () => {
        try {
            const response = await api.get('/portaria/empresas');
            setEmpresas(response.data);
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.empresa_id) {
            alert('Você precisa selecionar uma empresa primeiro!');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/portaria/pessoas', formData);
            alert('Funcionário cadastrado com sucesso!');
            setFormData({ empresa_id: '', nome: '', documento: '' });
            onFuncionarioSalvo(response.data.dados[0]);
            handleClose();
        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            alert('Erro ao salvar funcionário.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: '#EB2737', color: '#fff' }}>
                <Modal.Title>Cadastrar Funcionário Terceiro</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Selecione a Empresa *</Form.Label>
                        <Form.Select
                            required
                            value={formData.empresa_id}
                            onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                            className="form-select-premium"
                        >
                            <option value="">-- Escolha a Empresa Terceira --</option>
                            {empresas.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.nome}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Nome do Funcionário *</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            placeholder="Ex: João da Silva"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            className="form-control-premium"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Documento (RG ou CPF) *</Form.Label>
                        <Form.Control
                            type="text"
                            required
                            placeholder="Ex: 123.456.789-00"
                            value={formData.documento}
                            onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                            className="form-control-premium"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="bg-light d-flex flex-column flex-sm-row">
                    <Button variant="secondary" size="lg" className="w-100 mb-2 mb-sm-0" onClick={handleClose}>Cancelar</Button>
                    <Button type="submit" size="lg" className="w-100 text-white" disabled={loading} style={{ backgroundColor: '#EB2737', border: 'none' }}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Salvar Funcionário'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}