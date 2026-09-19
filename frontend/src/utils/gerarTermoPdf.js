import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoVideplast from '../assets/videplast-brand2.png';

const getBase64FromUrl = async (url) => {
    try {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result);
            }
        });
    } catch (e) {
        console.error("Erro ao converter imagem", e);
        return null;
    }
};

export const gerarTermoEntradaPDF = async (dados) => {
    const doc = new jsPDF();

    const dataAtual = dados.dataEntrada ? new Date(dados.dataEntrada).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
    const dataSaida = dados.dataSaida ? new Date(dados.dataSaida).toLocaleDateString('pt-BR') : '';

    try {
        const logoBase64 = await getBase64FromUrl(logoVideplast);
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', 14, 12, 55, 12);
        } else {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(235, 39, 55);
            doc.text("VIDEPLAST", 14, 20);
        }
    } catch (error) {
        console.error("Erro ao carregar a logo do cabeçalho:", error);
    }

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text("55 64 3620 4500 | videplast.com.br", 14, 30);
    doc.text("Via Secundária 3, Qd 09, CP 551 Dist. Agroindustrial II", 14, 35);
    doc.text("CEP 75.901-970, Rio Verde/GO", 14, 40);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("ENTRADA E SAÍDA DE EQUIPAMENTOS ELETRÔNICOS E CAIXA DE FERRAMENTA", 105, 53, { align: 'center' });
    doc.text("DOS PRESTADORES DE SERVIÇO.", 105, 58, { align: 'center' });

    const descricaoCompleta = `${dados.equipamentoDescricao} ${dados.marcaModelo ? `(${dados.marcaModelo})` : ''} ${dados.numeroSerie ? `- Série: ${dados.numeroSerie}` : ''}`;

    autoTable(doc, {
        startY: 65,
        head: [['DESCRIÇÃO / MARCA / Nº SÉRIE', 'UNID.', 'DATA ENTRADA', 'DATA SAÍDA', 'ASSINATURA']],
        body: [
            [
                descricaoCompleta,
                String(dados.quantidade).padStart(2, '0'),
                dataAtual,
                dataSaida,
                ''
            ]
        ],
        theme: 'grid',
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
        },
        styles: { halign: 'center', valign: 'middle', fontSize: 9 },
        columnStyles: { 0: { halign: 'left', cellWidth: 80 } }
    });

    let currentY = doc.lastAutoTable.finalY + 10;

    if (dados.fotoEquipamento) {
        try {
            let imgBase64 = dados.fotoEquipamento;

            if (imgBase64.startsWith('http')) {
                const converted = await getBase64FromUrl(imgBase64);
                if (converted) imgBase64 = converted;
            }

            if (imgBase64.startsWith('data:image')) {
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("Registro Fotográfico:", 14, currentY);

                doc.addImage(imgBase64, 'JPEG', 14, currentY + 3, 60, 45);
                currentY += 55;
            }
        } catch (error) {
            console.error("Erro ao adicionar foto ao PDF", error);
        }
    }

    if (currentY > 210) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Termo de Responsabilidade", 14, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const textoTermo = "A empresa Videplast Rio Verde, não se responsabiliza pelos equipamentos e caixa de ferramentas do Prestador de Serviço acima relacionados. Sendo de responsabilidade do usuário zelar pelas suas ferramentas.";
    const splitText = doc.splitTextToSize(textoTermo, 180);
    doc.text(splitText, 14, currentY + 7);

    const sigY = currentY + 35;

    doc.setFont("helvetica", "bold");
    doc.text("PRESTADOR DE SERVIÇO:", 14, sigY);
    doc.setFont("helvetica", "normal");
    doc.text(dados.empresaNome || 'Não informada', 65, sigY);

    doc.setFont("helvetica", "bold");
    doc.text("NOME RESPONSÁVEL:", 14, sigY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(dados.terceiroNome || 'Não informado', 58, sigY + 12);

    doc.line(55, sigY + 13, 140, sigY + 13);

    doc.setFont("helvetica", "bold");
    doc.text("DATA:", 150, sigY + 12);
    doc.setFont("helvetica", "normal");
    doc.text(dataAtual, 165, sigY + 12);
    doc.line(162, sigY + 13, 190, sigY + 13);

    doc.setFont("helvetica", "bold");
    doc.text("PORTARIA:", 14, sigY + 28);
    doc.setFont("helvetica", "normal");
    doc.text(dados.operadorNome || 'Operador', 38, sigY + 28);

    doc.line(35, sigY + 29, 140, sigY + 29);

    doc.setFont("helvetica", "bold");
    doc.text("DATA:", 150, sigY + 28);
    doc.setFont("helvetica", "normal");
    doc.text(dataAtual, 165, sigY + 28);
    doc.line(162, sigY + 29, 190, sigY + 29);

    const nomeArquivo = `Termo_${(dados.terceiroNome || 'Terceiro').replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    doc.save(nomeArquivo);
};