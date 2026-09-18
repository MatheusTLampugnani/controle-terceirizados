import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import { getOperadorAtual } from '../utils/auth';
import api from '../services/api';

export default function ModalSaida({ show, handleClose, itemSelecionado, onSaidaSucesso }) {
    const [loading, setLoading] = useState(false);
    const [observacaoSaida, setObservacaoSaida] = useState('');
    const [autorizadoPor, setAutorizadoPor] = useState('');
    const [retiradoPor, setRetiradoPor] = useState('');

    const sigCanvas = useRef(null);
    const operador = getOperadorAtual();

    const limparAssinatura = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
    };

    const handleLiberarSaida = async (e) => {
        e.preventDefault();

        if (!itemSelecionado) return;

        let assinaturaBase64 = '';
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            assinaturaBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
        } else {
            alert("Por favor, colete a assinatura do terceiro para comprovar a saída do equipamento.");
            return;
        }

        setLoading(true);

        try {
            await api.put(`/portaria/saida/${itemSelecionado.id}`, {
                cracha_saida: operador.cracha,
                observacao_saida: observacaoSaida,
                autorizadoPor: autorizadoPor,
                retiradoPor: retiradoPor,
                assinatura_terceiro: assinaturaBase64
            });

            setObservacaoSaida('');
            if (sigCanvas.current) sigCanvas.current.clear();
            setAutorizadoPor('');
            setRetiradoPor('');
            onSaidaSucesso();
            handleClose();
        } catch (error) {
            console.error("Erro ao registrar saída:", error);
            alert("Erro ao processar a liberação de saída.");
        } finally {
            setLoading(false);
        }
    };

    if (!itemSelecionado) return null;

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#EB2737', color: '#fff' }}>
                <Modal.Title className="fw-bold">Liberar Saída de Equipamento</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleLiberarSaida}>
                <Modal.Body className="p-4 bg-light">

                    <div className="bg-white p-3 rounded shadow-sm mb-3">
                        <h6 className="text-secondary fw-bold mb-2">Resumo do Item:</h6>
                        <p className="mb-1"><strong>Equipamento:</strong> {itemSelecionado.equipamento_descricao} ({itemSelecionado.marca_modelo || 'Sem marca'})</p>
                        <p className="mb-1"><strong>Terceiro:</strong> {itemSelecionado.pessoas_terceiras?.nome} — <strong>Empresa:</strong> {itemSelecionado.pessoas_terceiras?.empresas_terceiras?.nome}</p>
                        <p className="mb-0"><strong>Quantidade:</strong> {itemSelecionado.quantidade} unidade(s)</p>
                    </div>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Observação de Saída (Opcional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Ex: Equipamento conferido e devolvido sem avarias."
                                    value={observacaoSaida}
                                    onChange={(e) => setObservacaoSaida(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Autorizado por *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Quem liberou a saída"
                                    value={autorizadoPor}
                                    onChange={(e) => setAutorizadoPor(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Retirado por *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Quem retirou o equipamento"
                                    value={retiradoPor}
                                    onChange={(e) => setRetiradoPor(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Label className="fw-semibold">Assinatura de Comprovação de Saída (Terceiro) *</Form.Label>
                            <div className="border rounded bg-white p-3 d-flex flex-column align-items-center shadow-sm">
                                <div style={{ touchAction: 'none', display: 'inline-block' }} className="border rounded overflow-hidden">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        penColor="black"
                                        canvasProps={{
                                            width: 700,
                                            height: 180,
                                            className: 'sigCanvas'
                                        }}
                                    />
                                </div>
                                <div className="mt-2 text-end" style={{ width: '100%', maxWidth: '700px' }}>
                                    <Button variant="outline-secondary" size="sm" type="button" onClick={limparAssinatura}>
                                        Limpar Assinatura
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="success" type="submit" disabled={loading} className="px-4 fw-bold">
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Confirmar Saída'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}