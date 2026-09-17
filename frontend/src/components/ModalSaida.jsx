import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import api from '../services/api';

export default function ModalSaida({ show, handleClose, itemSelecionado, onSaidaSucesso }) {
    const [loading, setLoading] = useState(false);
    const [observacaoSaida, setObservacaoSaida] = useState('');

    const sigCanvas = useRef(null);
    const crachaLogado = localStorage.getItem('cracha_ativo');

    const limparAssinatura = () => {
        sigCanvas.current.clear();
    };

    const handleLiberarSaida = async (e) => {
        e.preventDefault();

        if (!itemSelecionado) return;

        // Valida se a assinatura foi feita
        let assinaturaBase64 = '';
        if (!sigCanvas.current.isEmpty()) {
            assinaturaBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
        } else {
            alert("Por favor, colete a assinatura do terceiro para comprovar a saída do equipamento.");
            return;
        }

        setLoading(true);

        try {
            await api.put(`/portaria/saida/${itemSelecionado.id}`, {
                cracha_saida_id: crachaLogado,
                observacao_saida: observacaoSaida,
                assinatura_terceiro: assinaturaBase64 // Salva a assinatura da saída
            });

            setObservacaoSaida('');
            if (sigCanvas.current) sigCanvas.current.clear();

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
        <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static" dialogClassName="modal-xxl">
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

                    <Row>
                        <Col md={12}>
                            <Form.Label className="fw-semibold">Assinatura de Comprovação de Saída (Terceiro) *</Form.Label>
                            <div className="border rounded bg-white p-3 d-flex flex-column align-items-center shadow-sm">
                                <div style={{ touchAction: 'none', display: 'inline-block' }} className="border rounded overflow-hidden">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        penColor="black"
                                        canvasProps={{
                                            width: 850,
                                            height: 250,
                                            className: 'sigCanvas'
                                        }}
                                    />
                                </div>
                                <div className="mt-2 text-end" style={{ width: '100%', maxWidth: '850px' }}>
                                    <Button variant="outline-secondary" size="sm" type="button" onClick={limparAssinatura}>
                                        Limpar Assinatura
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                </Modal.Body>
                <Modal.Footer className="bg-white">
                    <Button variant="secondary" onClick={handleClose} disabled={loading} size="sm">
                        Cancelar
                    </Button>
                    <Button variant="success" type="submit" disabled={loading} size="sm" className="px-4 fw-bold">
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Confirmar Saída'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}