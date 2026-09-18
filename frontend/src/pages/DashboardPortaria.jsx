import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Spinner, Card, Form, InputGroup, Nav } from 'react-bootstrap';
import api from '../services/api';
import { getOperadorAtual } from '../utils/auth';
import logoVideplast from '../assets/videplast-brand.png';
import {
    BsBoxSeam,
    BsSearch,
    BsPlusCircle,
    BsBuilding,
    BsPersonPlus,
    BsBoxArrowRight,
    BsArrowClockwise,
    BsInbox,
    BsClockHistory
} from 'react-icons/bs';
import ModalEntrada from '../components/ModalEntrada';
import ModalSaida from '../components/ModalSaida';
import ModalEmpresa from '../components/ModalEmpresa';
import ModalFuncionario from '../components/ModalFuncionario';
import ModalDetalhes from '../components/ModalDetalhes';

export default function DashboardPortaria({ onLogout }) {
    const [abaAtiva, setAbaAtiva] = useState('pendentes');
    const [pendentes, setPendentes] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState('');

    const operador = getOperadorAtual();
    const [nomeOperadorExibicao, setNomeOperadorExibicao] = useState(operador.nome);

    const [showModalEntrada, setShowModalEntrada] = useState(false);
    const [showModalEmpresa, setShowModalEmpresa] = useState(false);
    const [showModalFuncionario, setShowModalFuncionario] = useState(false);
    const [showModalSaida, setShowModalSaida] = useState(false);
    const [itemParaSaida, setItemParaSaida] = useState(null);
    const [showModalDetalhes, setShowModalDetalhes] = useState(false);
    const [itemDetalhes, setItemDetalhes] = useState(null);

    // Função de carregamento declarada antes de ser utilizada nos hooks/botões
    const carregarDados = async () => {
        setLoading(true);
        try {
            const rota = abaAtiva === 'pendentes' ? '/portaria/pendentes' : '/portaria/historico';
            const response = await api.get(rota);

            let dadosValidados = [];

            if (Array.isArray(response.data)) {
                dadosValidados = response.data;
            } else if (response.data && Array.isArray(response.data.dados)) {
                dadosValidados = response.data.dados;
            } else {
                console.error("A API não retornou uma lista válida:", response.data);
            }

            if (abaAtiva === 'pendentes') {
                setPendentes(dadosValidados);
            } else {
                setHistorico(dadosValidados);
            }

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            if (abaAtiva === 'pendentes') setPendentes([]);
            else setHistorico([]);
        } finally {
            setLoading(false);
        }
    };

    const buscarNomeOperadorReal = async () => {
        const crachaAtivo = localStorage.getItem('cracha_ativo');
        if (!crachaAtivo) return;

        try {
            const response = await api.get(`/portaria/login/${crachaAtivo}`);
            if (response.data && response.data.usuario) {
                const nomeCompleto = response.data.usuario.nome_completo;
                localStorage.setItem('nome_operador', nomeCompleto);
                setNomeOperadorExibicao(`${nomeCompleto} - ${crachaAtivo}`);
            }
        } catch (error) {
            console.error("Erro ao buscar nome completo do operador:", error);
            setNomeOperadorExibicao(`Operador - ${crachaAtivo}`);
        }
    };

    useEffect(() => {
        carregarDados();
        buscarNomeOperadorReal();
    }, [abaAtiva]);

    const abrirModalDetalhes = (item) => {
        setItemDetalhes(item);
        setShowModalDetalhes(true);
    };

    const abrirModalSaida = (item) => {
        setItemParaSaida(item);
        setShowModalSaida(true);
    };

    const listaAtual = abaAtiva === 'pendentes' ? pendentes : historico;

    const listaFiltrada = listaAtual.filter((item) => {
        const busca = termoBusca.toLowerCase();
        const equipamento = item.equipamento_descricao?.toLowerCase() || '';
        const pessoa = item.pessoas_terceiras?.nome?.toLowerCase() || '';
        const empresa = item.pessoas_terceiras?.empresas_terceiras?.nome?.toLowerCase() || '';
        const serie = item.numero_serie?.toLowerCase() || '';

        return equipamento.includes(busca) || pessoa.includes(busca) || empresa.includes(busca) || serie.includes(busca);
    });

    const formatarData = (dataIso) => dataIso ? new Date(dataIso).toLocaleDateString('pt-BR') : '—';
    const formatarHora = (dataIso) => dataIso ? new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '40px' }}>
            <div className="bg-white border-bottom shadow-sm py-3 mb-4" style={{ borderTop: '4px solid #EB2737' }}>
                <Container fluid className="px-3 px-md-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 w-100" style={{ minWidth: 0 }}>
                            <img
                                src={logoVideplast}
                                alt="Videplast Logo"
                                style={{ height: '40px', objectFit: 'contain' }}
                                className="mb-1 mb-sm-0"
                            />
                            <div className="w-100" style={{ minWidth: 0 }}>
                                <span
                                    className="text-uppercase fw-bold text-secondary d-block text-truncate"
                                    style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}
                                >
                                    Controle de Portaria - Terceiros
                                </span>
                                <small className="text-muted">
                                    Logado como: <strong style={{ color: '#EB2737' }}>{nomeOperadorExibicao}</strong>
                                </small>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 w-100 justify-content-start justify-content-lg-end">
                            <Button
                                variant="outline-dark"
                                size="sm"
                                onClick={() => setShowModalEmpresa(true)}
                                className="flex-fill flex-lg-grow-0 d-flex justify-content-center align-items-center gap-1 border-secondary"
                            >
                                <BsBuilding /> Empresa
                            </Button>

                            <Button
                                variant="outline-dark"
                                size="sm"
                                onClick={() => setShowModalFuncionario(true)}
                                className="flex-fill flex-lg-grow-0 d-flex justify-content-center align-items-center gap-1 border-secondary"
                            >
                                <BsPersonPlus /> Funcionário
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => setShowModalEntrada(true)}
                                className="flex-fill flex-lg-grow-0 fw-bold px-3 d-flex justify-content-center align-items-center gap-1 text-white"
                                style={{ backgroundColor: '#EB2737', border: 'none' }}
                            >
                                <BsPlusCircle /> Registrar
                            </Button>

                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={onLogout}
                                className="flex-fill flex-lg-grow-0 d-flex justify-content-center align-items-center gap-1"
                            >
                                <BsBoxArrowRight /> Sair
                            </Button>
                        </div>

                    </div>
                </Container>
            </div>

            <Container fluid className="px-4">
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="py-2">
                        <Nav variant="pills" className="flex-column flex-sm-row" activeKey={abaAtiva} onSelect={(k) => setAbaAtiva(k)}>
                            <Nav.Item className="mb-2 mb-sm-0 me-sm-2">
                                <Nav.Link
                                    eventKey="pendentes"
                                    className="fw-bold d-flex align-items-center justify-content-center gap-2"
                                    style={{
                                        backgroundColor: abaAtiva === 'pendentes' ? '#EB2737' : 'transparent',
                                        color: abaAtiva === 'pendentes' ? '#FFFFFF' : '#495057'
                                    }}
                                >
                                    <BsBoxSeam /> Pendentes na Empresa ({pendentes.length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link
                                    eventKey="historico"
                                    className="fw-bold d-flex align-items-center justify-content-center gap-2"
                                    style={{
                                        backgroundColor: abaAtiva === 'historico' ? '#EB2737' : 'transparent',
                                        color: abaAtiva === 'historico' ? '#FFFFFF' : '#495057'
                                    }}
                                >
                                    <BsClockHistory /> Histórico Completo de Movimentações
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Body>
                </Card>

                <Row className="mb-4">
                    <Col md={12}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="py-3">
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0 text-muted">
                                        <BsSearch />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Pesquisar por equipamento, marca, funcionário ou empresa..."
                                        value={termoBusca}
                                        onChange={(e) => setTermoBusca(e.target.value)}
                                        className="border-start-0 bg-light shadow-none"
                                    />
                                    {termoBusca && (
                                        <Button variant="outline-secondary" onClick={() => setTermoBusca('')}>Limpar</Button>
                                    )}
                                </InputGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white py-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
                        <h5 className="m-0 fw-bold" style={{ color: '#EB2737' }}>
                            {abaAtiva === 'pendentes' ? 'Equipamentos Atualmente na Planta' : 'Histórico Geral de Entradas e Saídas'}
                        </h5>
                        <Button variant="link" className="text-decoration-none p-0 text-muted d-flex align-items-center gap-1" onClick={carregarDados}>
                            <BsArrowClockwise /> Atualizar Dados
                        </Button>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" style={{ color: '#EB2737' }} />
                                <p className="mt-2 text-muted">Carregando registros...</p>
                            </div>
                        ) : (
                            <>
                                <div className="d-md-none p-3">
                                    {listaFiltrada.length > 0 ? listaFiltrada.map((item) => {
                                        const jaSaiu = item.data_hora_saida != null;
                                        return (
                                            <div
                                                key={item.id}
                                                className="card mb-3 border-0 shadow-sm"
                                                onClick={() => abrirModalDetalhes(item)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="card-body p-3">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className="fw-bold text-dark" style={{ fontSize: '1rem' }}>
                                                            {item.equipamento_descricao}
                                                        </span>
                                                        {jaSaiu
                                                            ? <span className="badge bg-success">Saiu</span>
                                                            : <span className="badge bg-warning text-dark">Pendente</span>
                                                        }
                                                    </div>

                                                    <div className="mb-2">
                                                        <div className="fw-semibold text-dark">{item.pessoas_terceiras?.nome || '—'}</div>
                                                        <small style={{ color: '#EB2737', fontWeight: '600' }}>
                                                            {item.pessoas_terceiras?.empresas_terceiras?.nome || '—'}
                                                        </small>
                                                    </div>

                                                    <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: '0.8rem' }}>
                                                        <span>
                                                            <strong>Entrada:</strong> {formatarHora(item.data_hora_entrada)} · {formatarData(item.data_hora_entrada)}
                                                        </span>
                                                        <span>
                                                            <strong>Qtde:</strong> {item.quantidade}
                                                        </span>
                                                    </div>

                                                    {jaSaiu && item.autorizado_por && (
                                                        <div className="mt-2" style={{ fontSize: '0.85rem' }}>
                                                            <span className="text-muted">Autorizado por: </span>
                                                            <strong style={{ color: '#EB2737' }}>{item.autorizado_por}</strong>
                                                        </div>
                                                    )}

                                                    {abaAtiva === 'pendentes' && (
                                                        <div className="mt-3">
                                                            <Button
                                                                variant="success"
                                                                className="w-100 fw-bold"
                                                                size="lg"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    abrirModalSaida(item);
                                                                }}
                                                            >
                                                                Liberar Saída
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-5 text-muted">
                                            <div className="fs-2 mb-2"><BsInbox /></div>
                                            <p>Nenhum registro encontrado.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="d-none d-md-block table-responsive">
                                    <Table hover className="align-middle mb-0 text-nowrap">
                                        <thead className="text-uppercase fs-7 text-white" style={{ backgroundColor: '#EB2737' }}>
                                            <tr>
                                                <th className="py-3 ps-3">Entrada</th>
                                                <th className="py-3">Saída</th>
                                                <th className="py-3">Empresa / Terceiro</th>
                                                <th className="py-3">Equipamento</th>
                                                <th className="py-3 d-none d-lg-table-cell">Detalhes / Série</th>
                                                <th className="py-3 text-center">Qtde</th>
                                                <th className="py-3 d-none d-xl-table-cell">Observação</th>
                                                <th className="py-3 text-center d-none d-md-table-cell">Status / Operador</th>
                                                {abaAtiva === 'pendentes' && <th className="py-3 text-center pe-3">Ação</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {listaFiltrada.length > 0 ? (
                                                listaFiltrada.map((item) => {
                                                    const jaSaiu = item.data_hora_saida != null;
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            onClick={() => abrirModalDetalhes(item)}
                                                            style={{ cursor: 'pointer' }}
                                                            title="Clique para ver os detalhes completos"
                                                        >
                                                            <td className="ps-3">
                                                                <div className="fw-bold">{formatarHora(item.data_hora_entrada)}</div>
                                                                <small className="text-muted">{formatarData(item.data_hora_entrada)}</small>
                                                            </td>

                                                            <td>
                                                                {jaSaiu ? (
                                                                    <div>
                                                                        <div className="fw-bold text-success">{formatarHora(item.data_hora_saida)}</div>
                                                                        <small className="text-muted">{formatarData(item.data_hora_saida)}</small>
                                                                    </div>
                                                                ) : (
                                                                    <span className="badge bg-warning text-dark">Pendente</span>
                                                                )}
                                                            </td>

                                                            <td>
                                                                <div className="fw-bold text-dark">{item.pessoas_terceiras?.nome || '—'}</div>
                                                                <small style={{ color: '#EB2737', fontWeight: '600' }}>{item.pessoas_terceiras?.empresas_terceiras?.nome || '—'}</small>
                                                            </td>

                                                            <td>
                                                                <div className="fw-bold text-dark">{item.equipamento_descricao}</div>
                                                            </td>

                                                            <td className="d-none d-lg-table-cell">
                                                                <div>{item.marca_modelo || 'Sem marca'}</div>
                                                                <small className="text-muted">Série: {item.numero_serie || 'N/I'}</small>
                                                            </td>

                                                            <td className="text-center">
                                                                <span className="badge bg-secondary rounded-pill">{item.quantidade}</span>
                                                            </td>

                                                            <td className="d-none d-xl-table-cell">
                                                                <span className="text-muted text-wrap d-inline-block" style={{ maxWidth: '180px', fontSize: '0.9rem' }}>
                                                                    {item.observacao || '—'}
                                                                </span>
                                                            </td>

                                                            <td className="text-center d-none d-md-table-cell">
                                                                {jaSaiu ? (
                                                                    <small className="text-muted d-block text-start">
                                                                        Operador (Saída): <strong>{item.cracha_saida?.nome_completo || item.cracha_saida || 'Portaria'}</strong><br />
                                                                        Autorizado por: <strong style={{ color: '#EB2737' }}>{item.autorizado_por || 'Não informado'}</strong>
                                                                    </small>
                                                                ) : (
                                                                    <small className="text-muted d-block text-start">
                                                                        Entrada por: <br /><strong>{item.cracha_entrada?.nome_completo || item.cracha_entrada || 'Portaria'}</strong>
                                                                    </small>
                                                                )}
                                                            </td>

                                                            {abaAtiva === 'pendentes' && (
                                                                <td className="text-center pe-3">
                                                                    <Button
                                                                        variant="outline-success"
                                                                        size="sm"
                                                                        className="fw-bold px-3 py-1 shadow-sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            abrirModalSaida(item);
                                                                        }}
                                                                    >
                                                                        Liberar Saída
                                                                    </Button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={abaAtiva === 'pendentes' ? '9' : '8'} className="text-center py-5 text-muted text-wrap">
                                                        <div className="fs-2 mb-2 text-secondary">
                                                            <BsInbox />
                                                        </div>
                                                        Nenhum registro encontrado nesta visualização.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            <ModalEntrada
                show={showModalEntrada}
                handleClose={() => setShowModalEntrada(false)}
                onEntradaSucesso={carregarDados}
            />

            <ModalSaida
                show={showModalSaida}
                handleClose={() => setShowModalSaida(false)}
                itemSelecionado={itemParaSaida}
                onSaidaSucesso={carregarDados}
            />

            <ModalEmpresa
                show={showModalEmpresa}
                handleClose={() => setShowModalEmpresa(false)}
                onEmpresaSalva={() => setShowModalEmpresa(false)}
            />

            <ModalFuncionario
                show={showModalFuncionario}
                handleClose={() => setShowModalFuncionario(false)}
                onFuncionarioSalvo={() => setShowModalFuncionario(false)}
            />

            <ModalDetalhes
                show={showModalDetalhes}
                handleClose={() => setShowModalDetalhes(false)}
                item={itemDetalhes}
            />

        </div>
    );
}