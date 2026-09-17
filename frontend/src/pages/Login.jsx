import React, { useState } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { BsPersonBadgeFill } from 'react-icons/bs';

export default function Login({ onLogin }) {
    const [cracha, setCracha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cracha) return;

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            onLogin(cracha);
        } catch (error) {
            console.error("Erro no login", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f4f6f9' }}>
            <Container>
                <div className="mx-auto" style={{ maxWidth: '420px' }}>

                    <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                        <div style={{ height: '6px', backgroundColor: '#EB2737' }}></div>

                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <div
                                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{ width: '70px', height: '70px', backgroundColor: 'rgba(235, 39, 55, 0.1)', color: '#EB2737' }}
                                >
                                    <BsPersonBadgeFill size={36} />
                                </div>
                                <h4 className="fw-bold text-dark mb-1">Controle de Portaria</h4>
                                <p className="text-muted small">Insira seu crachá corporativo para iniciar o turno</p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold small text-secondary text-uppercase" style={{ letterSpacing: '1px' }}>
                                        Número do Crachá
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="lg"
                                        placeholder="Ex: 33445"
                                        value={cracha}
                                        onChange={(e) => setCracha(e.target.value)}
                                        required
                                        className="fw-bold fs-4 py-3"
                                        style={{ letterSpacing: '2px' }}
                                        autoFocus
                                    />
                                </Form.Group>

                                <Button
                                    variant="danger"
                                    type="submit"
                                    size="lg"
                                    className="w-100 fw-bold shadow-sm py-3"
                                    style={{ backgroundColor: '#EB2737', border: 'none' }}
                                    disabled={loading || !cracha}
                                >
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Acessar Sistema'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
}