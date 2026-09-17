import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import api from '../services/api';

export default function ModalEmpresa({ show, handleClose, onEmpresaSalva }) {
    const [nome, setNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCnpjChange = (e) => {
        let valor = e.target.value.replace(/\D/g, '');

        if (valor.length > 14) valor = valor.slice(0, 14);

        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');

        setCnpj(valor);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/portaria/empresas', {
                nome,
                cnpj: cnpj || null
            });

            setNome('');
            setCnpj('');

            onEmpresaSalva();
        } catch (error) {
            console.error("Erro ao cadastrar empresa:", error);
            alert("Erro ao salvar a empresa.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <Modal.Header closeButton style={{ backgroundColor: '#EB2737', color: '#fff' }}>
                <Modal.Title className="fw-bold">Cadastrar Nova Empresa</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Nome da Empresa Terceira *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Ex: Construtora Silva LTDA"
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label className="fw-semibold">CNPJ *</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="00.000.000/0000-00"
                            required
                            value={cnpj}
                            onChange={handleCnpjChange}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading} style={{ backgroundColor: '#EB2737', border: 'none' }}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Salvar Empresa'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}