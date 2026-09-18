import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Image } from 'react-bootstrap';
import api from '../services/api';
import { getOperadorAtual } from '../utils/auth';

export default function ModalEntrada({ show, handleClose, onEntradaSucesso }) {
    const [loading, setLoading] = useState(false);
    const [pessoas, setPessoas] = useState([]);
    const [previewImagem, setPreviewImagem] = useState('');

    const operador = getOperadorAtual();

    const [formData, setFormData] = useState({
        pessoa_id: '',
        equipamento_descricao: '',
        marca_modelo: '',
        numero_serie: '',
        quantidade: 1,
        observacao: '',
        cracha_entrada_id: operador.cracha || '',
        foto_equipamento_url: ''
    });

    useEffect(() => {
        if (show) {
            carregarPessoas();
            const operadorAtualizado = getOperadorAtual();
            setFormData(prev => ({ ...prev, cracha_entrada_id: operadorAtualizado.cracha || '' }));
        }
    }, [show]);

    const carregarPessoas = async () => {
        try {
            const response = await api.get('/portaria/pessoas');
            setPessoas(response.data);
        } catch (error) {
            console.error("Erro ao carregar funcionários:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompressImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1400;
                const MAX_HEIGHT = 1400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrlComprimido = canvas.toDataURL('image/jpeg', 0.85);
                setPreviewImagem(dataUrlComprimido);
                setFormData(prev => ({ ...prev, foto_equipamento_url: dataUrlComprimido }));
            };
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.pessoa_id) {
            alert("Selecione o funcionário responsável pelo equipamento!");
            return;
        }

        setLoading(true);

        try {
            const dadosParaEnviar = { ...formData };

            await api.post('/portaria/entrada', dadosParaEnviar);

            setFormData({
                pessoa_id: '',
                equipamento_descricao: '',
                marca_modelo: '',
                numero_serie: '',
                quantidade: 1,
                observacao: '',
                cracha_entrada_id: operador.cracha || '',
                foto_equipamento_url: ''
            });
            setPreviewImagem('');

            onEntradaSucesso();
            handleClose();
        } catch (error) {
            console.error("Erro ao registrar entrada:", error);
            alert("Erro ao salvar a entrada.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static" dialogClassName="modal-xxl">
            <Modal.Header closeButton style={{ backgroundColor: '#EB2737', color: '#fff' }}>
                <Modal.Title className="fw-bold">Registrar Nova Entrada de Equipamento</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Funcionário Terceiro *</Form.Label>
                                <Form.Select
                                    name="pessoa_id"
                                    required
                                    value={formData.pessoa_id}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Selecione o Funcionário e a Empresa --</option>
                                    {pessoas.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome} ({p.empresas_terceiras?.nome || 'Sem Empresa'}) - Doc: {p.documento}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Equipamento / Ferramenta *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="equipamento_descricao"
                                    required
                                    placeholder="Ex: Furadeira de Impacto"
                                    value={formData.equipamento_descricao || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Quantidade *</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="quantidade"
                                    min="1"
                                    required
                                    value={formData.quantidade}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Nº Série / Patrimônio</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="numero_serie"
                                    placeholder="Se houver"
                                    value={formData.numero_serie}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Marca / Modelo</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="marca_modelo"
                                    placeholder="Ex: Bosch / GSB 13 RE"
                                    value={formData.marca_modelo}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Foto do Equipamento</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCompressImage}
                                />
                            </Form.Group>
                            {previewImagem && (
                                <div className="mt-2 text-center bg-light p-2 rounded border">
                                    <a href={previewImagem} target="_blank" rel="noopener noreferrer">
                                        <Image src={previewImagem} alt="Preview" thumbnail style={{ maxHeight: '80px', cursor: 'zoom-in' }} />
                                    </a>
                                </div>
                            )}
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Observação (Estado do equipamento, maletas, etc)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="observacao"
                                    value={formData.observacao}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                </Modal.Body>
                <Modal.Footer className="bg-light px-4 py-3">
                    <Button variant="secondary" onClick={handleClose} disabled={loading} size="lg">
                        Cancelar
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading} size="lg" style={{ backgroundColor: '#EB2737', border: 'none' }}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Confirmar Entrada'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}