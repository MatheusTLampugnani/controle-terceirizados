import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Image, Card } from 'react-bootstrap';
import { BsPlusCircle, BsTrash } from 'react-icons/bs';
import Select from 'react-select';
import api from '../services/api';
import { gerarTermoEntradaPDF } from '../utils/gerarTermoPdf';
import { getOperadorAtual } from '../utils/auth';

export default function ModalEntrada({ show, handleClose, onEntradaSucesso }) {
    const [loading, setLoading] = useState(false);
    const [pessoas, setPessoas] = useState([]);

    const [pessoaId, setPessoaId] = useState('');
    const [equipamentos, setEquipamentos] = useState([{
        equipamento_descricao: '',
        marca_modelo: '',
        numero_serie: '',
        quantidade: 1,
        observacao: '',
        foto_equipamento_url: ''
    }]);

    useEffect(() => {
        if (show) {
            carregarPessoas();
            setPessoaId('');
            setEquipamentos([{
                equipamento_descricao: '',
                marca_modelo: '',
                numero_serie: '',
                quantidade: 1,
                observacao: '',
                foto_equipamento_url: ''
            }]);
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

    const adicionarEquipamento = () => {
        setEquipamentos([...equipamentos, {
            equipamento_descricao: '',
            marca_modelo: '',
            numero_serie: '',
            quantidade: 1,
            observacao: '',
            foto_equipamento_url: ''
        }]);
    };

    const removerEquipamento = (index) => {
        const novaLista = [...equipamentos];
        novaLista.splice(index, 1);
        setEquipamentos(novaLista);
    };

    const handleChange = (index, field, value) => {
        const novaLista = [...equipamentos];
        novaLista[index][field] = value;
        setEquipamentos(novaLista);
    };

    const handleCompressImage = (index, e) => {
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
                handleChange(index, 'foto_equipamento_url', dataUrlComprimido);
            };
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!pessoaId) {
            alert("Selecione o funcionário responsável pelo equipamento!");
            return;
        }

        const invalidos = equipamentos.filter(eq => eq.equipamento_descricao.trim() === '');
        if (invalidos.length > 0) {
            alert("Preencha a descrição de todos os equipamentos antes de guardar!");
            return;
        }

        setLoading(true);

        try {
            const operador = getOperadorAtual();
            const crachaLogado = operador.cracha || localStorage.getItem('cracha_ativo');

            await api.post('/portaria/entrada', {
                pessoa_id: pessoaId,
                cracha_entrada_id: crachaLogado,
                equipamentos: equipamentos
            });

            const pessoaSelecionada = pessoas.find(p => p.id.toString() === pessoaId.toString());

            const dadosPdf = {
                terceiroNome: pessoaSelecionada?.nome,
                empresaNome: pessoaSelecionada?.empresas_terceiras?.nome,
                operadorNome: operador.nome,
                equipamentos: equipamentos
            };

            await gerarTermoEntradaPDF(dadosPdf);

            onEntradaSucesso();
            handleClose();
        } catch (error) {
            console.error("Erro ao registar entrada em lote:", error);
            alert("Erro ao guardar a entrada.");
        } finally {
            setLoading(false);
        }
    };

    const opcoesPessoas = pessoas.map(p => ({
        value: p.id,
        label: `${p.nome} (${p.empresas_terceiras?.nome || 'Sem Empresa'}) - Doc: ${p.documento}`
    }));

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static" dialogClassName="modal-xxl">
            <Modal.Header closeButton style={{ backgroundColor: '#EB2737', color: '#fff' }}>
                <Modal.Title className="fw-bold">Registar Entrada de Ferramentas / Equipamentos</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4 bg-light">

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <Form.Group>
                                <Form.Label className="fw-semibold text-secondary">Funcionário Terceiro *</Form.Label>
                                <Select
                                    options={opcoesPessoas}
                                    value={opcoesPessoas.find(opt => opt.value === pessoaId) || null}
                                    onChange={(opcao) => setPessoaId(opcao ? opcao.value : '')}
                                    placeholder="Escreva para pesquisar o funcionário ou empresa..."
                                    isClearable
                                    isSearchable
                                    noOptionsMessage={() => "Nenhum funcionário encontrado"}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            padding: '4px',
                                            fontSize: '1rem'
                                        })
                                    }}
                                />
                            </Form.Group>
                        </Card.Body>
                    </Card>

                    <h5 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#EB2737' }}>
                        Lista de Equipamentos
                    </h5>

                    {equipamentos.map((item, index) => (
                        <Card key={index} className="mb-3 border-start border-4 shadow-sm" style={{ borderStartColor: '#EB2737' }}>
                            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-2">
                                <strong className="text-secondary">Item #{index + 1}</strong>
                                {equipamentos.length > 1 && (
                                    <Button variant="outline-danger" size="sm" onClick={() => removerEquipamento(index)}>
                                        <BsTrash /> Remover Item
                                    </Button>
                                )}
                            </Card.Header>
                            <Card.Body>
                                <Row className="mb-3">
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Equipamento / Ferramenta *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                required
                                                placeholder="Ex: Furadeira de Impacto"
                                                value={item.equipamento_descricao}
                                                onChange={(e) => handleChange(index, 'equipamento_descricao', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Quantidade *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                required
                                                value={item.quantidade}
                                                onChange={(e) => handleChange(index, 'quantidade', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Nº Série / Património</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Se houver"
                                                value={item.numero_serie}
                                                onChange={(e) => handleChange(index, 'numero_serie', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={5}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Marca / Modelo</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ex: Bosch / GSB 13 RE"
                                                value={item.marca_modelo}
                                                onChange={(e) => handleChange(index, 'marca_modelo', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={7}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Foto do Equipamento (Opcional)</Form.Label>
                                            <div className="d-flex align-items-center gap-3">
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleCompressImage(index, e)}
                                                />
                                                {item.foto_equipamento_url && (
                                                    <a href={item.foto_equipamento_url} target="_blank" rel="noopener noreferrer">
                                                        <Image src={item.foto_equipamento_url} rounded style={{ height: '40px', width: '40px', objectFit: 'cover', cursor: 'zoom-in' }} />
                                                    </a>
                                                )}
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold">Observação (Estado do equipamento, malas, etc)</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={1}
                                                value={item.observacao}
                                                onChange={(e) => handleChange(index, 'observacao', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}

                    <div className="d-grid mt-3">
                        <Button variant="outline-secondary" className="fw-bold p-3" onClick={adicionarEquipamento} style={{ borderStyle: 'dashed' }}>
                            <BsPlusCircle className="me-2" /> Adicionar mais um equipamento à lista
                        </Button>
                    </div>

                </Modal.Body>
                <Modal.Footer className="bg-white px-4 py-3 border-top">
                    <Button variant="secondary" onClick={handleClose} disabled={loading} size="lg">
                        Cancelar
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading} size="lg" style={{ backgroundColor: '#EB2737', border: 'none' }}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Confirmar e Gerar Termo'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}