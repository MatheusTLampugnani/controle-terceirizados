import React from 'react';
import { Modal, Button, Row, Col, Card, Image, Badge } from 'react-bootstrap';
import { BsClockHistory, BsBuilding, BsTools, BsCamera, BsPen } from 'react-icons/bs';

export default function ModalDetalhes({ show, handleClose, item, crachaAtivo }) {
    if (!item) return null;

    const formatarDataHora = (dataIso) => {
        if (!dataIso) return '—';
        const data = new Date(dataIso);
        return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const nomeOperador = localStorage.getItem('nome_operador') || `Crachá ${crachaAtivo}`;

    const jaSaiu = item.data_hora_saida != null;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: '#EB2737', color: '#fff' }}>
                <Modal.Title className="fw-bold">Detalhes da Movimentação</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">

                <Card className="border-0 shadow-sm mb-3">
                    <Card.Header className="bg-white fw-bold text-secondary border-bottom-0 pt-3 d-flex align-items-center">
                        <BsClockHistory className="me-2" size={18} /> Controle de Acesso
                    </Card.Header>
                    <Card.Body className="pt-0">
                        <Row>
                            <Col md={6} className="mb-2">
                                <small className="text-muted d-block">Data/Hora de Entrada:</small>
                                <strong className="text-dark">{formatarDataHora(item.data_hora_entrada)}</strong>
                                <small className="d-block text-muted">Registrado por: {nomeOperador}</small>
                            </Col>
                            <Col md={6}>
                                <small className="text-muted d-block">Data/Hora de Saída:</small>
                                {jaSaiu ? (
                                    <>
                                        <strong className="text-success">{formatarDataHora(item.data_hora_saida)}</strong>
                                        <small className="d-block text-muted">Liberado por: {item.cracha_saida?.nome_completo || 'N/I'}</small>
                                    </>
                                ) : (
                                    <Badge bg="warning" text="dark" className="px-3 py-2 mt-1">Ainda na Empresa (Pendente)</Badge>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm mb-3">
                    <Card.Header className="bg-white fw-bold text-secondary border-bottom-0 pt-3 d-flex align-items-center">
                        <BsBuilding className="me-2" size={18} /> Dados do Terceiro
                    </Card.Header>
                    <Card.Body className="pt-0">
                        <Row>
                            <Col md={6}>
                                <small className="text-muted d-block">Nome do Funcionário:</small>
                                <strong className="text-dark">{item.pessoas_terceiras?.nome || '—'}</strong>
                                <div className="mt-2">
                                    <small className="text-muted d-block">Documento:</small>
                                    <strong className="text-dark">{item.pessoas_terceiras?.documento || '—'}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <small className="text-muted d-block">Empresa Responsável:</small>
                                <strong style={{ color: '#EB2737' }}>{item.pessoas_terceiras?.empresas_terceiras?.nome || '—'}</strong>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm mb-3">
                    <Card.Header className="bg-white fw-bold text-secondary border-bottom-0 pt-3 d-flex align-items-center">
                        <BsTools className="me-2" size={18} /> Especificações do Equipamento
                    </Card.Header>
                    <Card.Body className="pt-0">
                        <Row>
                            <Col md={4} className="mb-2">
                                <small className="text-muted d-block">Descrição:</small>
                                <strong className="text-dark">{item.equipamento_descricao}</strong>
                            </Col>
                            <Col md={4} className="mb-2">
                                <small className="text-muted d-block">Marca / Modelo:</small>
                                <strong className="text-dark">{item.marca_modelo || 'N/I'}</strong>
                            </Col>
                            <Col md={4} className="mb-2">
                                <small className="text-muted d-block">Quantidade:</small>
                                <strong className="text-dark">{item.quantidade} unidade(s)</strong>
                            </Col>
                            <Col md={4} className="mb-2">
                                <small className="text-muted d-block">Número de Série / Patrimônio:</small>
                                <strong className="text-dark">{item.numero_serie || 'N/I'}</strong>
                            </Col>
                            <Col md={8} className="mb-2">
                                <small className="text-muted d-block">Observações (Estado):</small>
                                <span className="text-dark">{item.observacao || 'Nenhuma observação registrada.'}</span>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white fw-bold text-secondary text-center d-flex align-items-center justify-content-center">
                                <BsCamera className="me-2" size={18} /> Foto do Equipamento
                            </Card.Header>
                            <Card.Body className="d-flex align-items-center justify-content-center bg-light">
                                {item.foto_equipamento_url ? (
                                    <a href={item.foto_equipamento_url} target="_blank" rel="noopener noreferrer">
                                        <Image src={item.foto_equipamento_url} alt="Equipamento" thumbnail style={{ maxHeight: '150px', cursor: 'zoom-in' }} />
                                    </a>
                                ) : (
                                    <span className="text-muted small">Nenhuma foto registrada</span>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white fw-bold text-secondary text-center d-flex align-items-center justify-content-center">
                                <BsPen className="me-2" size={18} /> Assinatura do Terceiro
                            </Card.Header>
                            <Card.Body className="d-flex align-items-center justify-content-center bg-light">
                                {item.assinatura_terceiro ? (
                                    <Image src={item.assinatura_terceiro} alt="Assinatura" style={{ maxHeight: '100px', maxWidth: '100%' }} />
                                ) : (
                                    <span className="text-muted small">Nenhuma assinatura registrada</span>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Modal.Body>
            <Modal.Footer className="bg-white">
                <Button variant="secondary" onClick={handleClose} size="lg">
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}