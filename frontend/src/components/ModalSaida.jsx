import React, { useState, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import SignatureCanvas from 'react-signature-canvas';
import { getOperadorAtual } from '../utils/auth';
import api from '../services/api';
import { gerarTermoEntradaPDF } from '../utils/gerarTermoPdf';

export default function ModalSaida({ show, handleClose, itensSelecionados, onSaidaSucesso }) {
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

        if (!itensSelecionados || itensSelecionados.length === 0) return;

        let assinaturaBase64 = '';
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            assinaturaBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
        } else {
            alert("Por favor, recolha a assinatura do terceiro para comprovar a saída do(s) equipamento(s).");
            return;
        }

        setLoading(true);

        try {
            const ids = itensSelecionados.map(item => item.id);
            const dataHoraAtual = new Date();
            const codigoSaidaUnico = `OUT-${Date.now().toString().slice(-6)}`;
            await api.put(`/portaria/saida-lote`, {
                ids: ids,
                cracha_saida: operador.cracha,
                observacao_saida: observacaoSaida,
                autorizadoPor: autorizadoPor,
                retiradoPor: retiradoPor,
                assinatura_terceiro: assinaturaBase64,
                codigo_saida: codigoSaidaUnico
            });

            const terceiroNome = itensSelecionados[0]?.pessoas_terceiras?.nome;
            const empresaNome = itensSelecionados[0]?.pessoas_terceiras?.empresas_terceiras?.nome;

            const itensComDataSaida = itensSelecionados.map(item => ({
                ...item,
                data_hora_saida: dataHoraAtual
            }));

            const dadosPdf = {
                terceiroNome: terceiroNome,
                empresaNome: empresaNome,
                operadorNome: operador.nome,
                equipamentos: itensComDataSaida,
                assinaturaTerceiro: assinaturaBase64,
                dataEntrada: itensSelecionados[0]?.data_hora_entrada,
                codigo_saida: codigoSaidaUnico
            };

            await gerarTermoEntradaPDF(dadosPdf);

            setObservacaoSaida('');
            if (sigCanvas.current) sigCanvas.current.clear();
            setAutorizadoPor('');
            setRetiradoPor('');
            onSaidaSucesso();
            handleClose();
        } catch (error) {
            console.error("Erro ao registar saída:", error);
            alert("Erro ao processar a liberação de saída.");
        } finally {
            setLoading(false);
        }
    };

    if (!itensSelecionados || itensSelecionados.length === 0) return null;

    const terceiroNome = itensSelecionados[0].pessoas_terceiras?.nome;
    const empresaNome = itensSelecionados[0].pessoas_terceiras?.empresas_terceiras?.nome;

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#EB2737', color: '#fff' }}>
                <Modal.Title className="fw-bold">Liberar Saída de Equipamento(s)</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleLiberarSaida}>
                <Modal.Body className="p-4 bg-light">

                    <div className="bg-white p-3 rounded shadow-sm mb-3">
                        <h6 className="text-secondary fw-bold mb-2">Resumo da Saída:</h6>
                        <p className="mb-2"><strong>Terceiro:</strong> {terceiroNome} — <strong>Empresa:</strong> {empresaNome}</p>

                        <div className="border rounded p-2 bg-light" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                            <ul className="mb-0 ps-3">
                                {itensSelecionados.map(item => (
                                    <li key={item.id} className="small text-dark mb-1">
                                        <strong>{item.quantidade}x</strong> - {item.equipamento_descricao} {item.marca_modelo ? `(${item.marca_modelo})` : ''}
                                        {item.numero_serie ? ` [Série: ${item.numero_serie}]` : ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-2 text-end">
                            <Badge bg="danger">Total: {itensSelecionados.length} item(s)</Badge>
                        </div>
                    </div>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold">Observação de Saída (Opcional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    placeholder="Ex: Equipamentos conferidos e devolvidos sem avarias."
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
                                    placeholder="Quem autorizou a saída"
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
                                    placeholder="Quem retirou os equipamentos"
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
                                        canvasProps={{ width: 650, height: 180, className: 'sigCanvas' }}
                                    />
                                </div>
                                <div className="mt-2 text-end" style={{ width: '100%', maxWidth: '650px' }}>
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