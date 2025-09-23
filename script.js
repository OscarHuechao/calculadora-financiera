// Sincronizar porcentaje y valor de abono/pie
document.getElementById('porcentajePie').addEventListener('input', function(e) {
  // Permitir escribir cualquier número y punto
  let value = e.target.value.replace(/[^\d\.]/g, '');
  e.target.value = value;
  // Sincronizar valorPie
  const valorParcelaRaw = document.getElementById('valorParcela').value.replace(/[^\d]/g, '');
  const valorParcela = parseFloat(valorParcelaRaw);
  let porcentajePie = parseFloat(value);
  if (!isNaN(valorParcela) && !isNaN(porcentajePie)) {
    const abono = Math.round(valorParcela * (porcentajePie / 100));
    document.getElementById('valorPie').value = abono.toLocaleString('es-CL');
  } else {
    document.getElementById('valorPie').value = '';
  }
});

// Formatear porcentaje con dos decimales y símbolo % al perder el foco
document.getElementById('porcentajePie').addEventListener('blur', function(e) {
  let value = e.target.value.replace(/[^\d\.]/g, '');
  if (value) {
    value = parseFloat(value).toFixed(2) + '%';
    e.target.value = value;
  } else {
    e.target.value = '';
  }
});

document.getElementById('valorPie').addEventListener('input', function(e) {
  let value = e.target.value.replace(/[^\d]/g, ''); // Solo números
  if (value) {
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = '$ ' + value;
  } else {
    e.target.value = '$ ';
  }
  // Sincronizar porcentaje
  const valorParcelaRaw = document.getElementById('valorParcela').value.replace(/[^\d]/g, '');
  const valorParcela = parseFloat(valorParcelaRaw);
  const abonoRaw = value.replace(/\./g, '');
  const abono = parseFloat(abonoRaw);
  if (!isNaN(valorParcela) && !isNaN(abono) && valorParcela > 0) {
    const porcentaje = (abono / valorParcela) * 100;
    document.getElementById('porcentajePie').value = porcentaje.toFixed(2);
  } else {
    document.getElementById('porcentajePie').value = '';
  }
});
// Formateador chileno
const formatCLP = (num) => new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0
}).format(num);

const formatUF = (num) => {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num) + " UF";
};

// Obtener UF automáticamente
fetch("https://mindicador.cl/api")
  .then(response => response.json())
  .then(data => {
    const uf = data.uf.valor;
    document.getElementById("valorUF").value = uf.toLocaleString('es-CL', { minimumFractionDigits: 2 });
  })
  .catch(() => {
    document.getElementById("valorUF").value = "Error al cargar UF";
  });

// Formatear con puntos el valor de la parcela en tiempo real
document.getElementById('valorParcela').addEventListener('input', function(e) {
  let value = e.target.value.replace(/[^\d]/g, ''); // Solo números
  if (value) {
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    e.target.value = '$ ' + value;
  } else {
    e.target.value = '$ ';
  }
});
document.getElementById("creditForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const valorParcelaRaw = document.getElementById("valorParcela").value.replace(/[^\d]/g, '');
  const valorParcela = parseFloat(valorParcelaRaw);
  let abonoRaw = document.getElementById("valorPie").value.replace(/\./g, '').replace(/[^\d]/g, '');
  let abonoFinal = parseFloat(abonoRaw);
  let porcentajePie = parseFloat(document.getElementById("porcentajePie").value.replace('%',''));
  // Si el usuario ingresa el valor de abono/pie, usar ese valor
  if (!isNaN(abonoFinal) && abonoFinal > 0) {
    porcentajePie = valorParcela > 0 ? Math.round((abonoFinal / valorParcela) * 100) : 0;
  } else if (!isNaN(porcentajePie)) {
    abonoFinal = valorParcela * (porcentajePie / 100);
  } else {
    abonoFinal = 0;
    porcentajePie = 0;
  }
  const cuotas = parseInt(document.getElementById("cuotas").value);
  const interesMensual = parseFloat(document.getElementById("interesMensual").value);
  const valorUF = parseFloat(document.getElementById("valorUF").value.replace(/\./g, '').replace(',', '.'));

  const saldoFinanciar = valorParcela - abonoFinal;
  // Fórmula de anualidad para interés compuesto
  let valorCuota = 0;
  let totalConIntereses = 0;
  if (interesMensual > 0 && cuotas > 0) {
    const i = interesMensual / 100;
    valorCuota = saldoFinanciar * (i * Math.pow(1 + i, cuotas)) / (Math.pow(1 + i, cuotas) - 1);
    totalConIntereses = valorCuota * cuotas;
  } else {
    valorCuota = saldoFinanciar / cuotas;
    totalConIntereses = saldoFinanciar;
  }
  const totalParcela = abonoFinal + totalConIntereses;

  const resultadoHTML = `
    <h2>Resumen de Simulación</h2>
    <table>
      <tr><th>Concepto</th><th>CLP</th><th>UF</th></tr>
  <tr><td>Valor Parcela</td><td>${formatCLP(valorParcela)}</td><td>${formatUF(valorParcela / valorUF)}</td></tr>
  <tr><td>Abono o Pie</td><td>${formatCLP(abonoFinal)}</td><td>${formatUF(abonoFinal / valorUF)}</td></tr>
  <tr><td>Saldo a Financiar</td><td>${formatCLP(saldoFinanciar)}</td><td>${formatUF(saldoFinanciar / valorUF)}</td></tr>
      <tr><td>Número de Cuotas</td><td>${cuotas}</td><td>—</td></tr>
      <tr><td>Valor Cuota</td><td>${formatCLP(valorCuota)}</td><td>${formatUF(valorCuota / valorUF)}</td></tr>
      <tr><td>Total Cuotas con Intereses</td><td>${formatCLP(totalConIntereses)}</td><td>${formatUF(totalConIntereses / valorUF)}</td></tr>
      <tr><td>Valor Total Parcela</td><td>${formatCLP(totalParcela)}</td><td>${formatUF(totalParcela / valorUF)}</td></tr>
    </table>
  `;

  document.getElementById("resultado").innerHTML = resultadoHTML;
});

// Botón para limpiar datos
document.getElementById("btnLimpiar").addEventListener("click", function () {
  document.getElementById("valorParcela").value = "$ ";
  document.getElementById("porcentajePie").value = "";
  document.getElementById("valorPie").value = "$ ";
  document.getElementById("cuotas").value = "";
  document.getElementById("interesMensual").value = "";
  document.getElementById("resultado").innerHTML = "";
});