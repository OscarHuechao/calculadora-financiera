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
  const porcentajePie = parseFloat(document.getElementById("porcentajePie").value);
  const cuotas = parseInt(document.getElementById("cuotas").value);
  const interesMensual = parseFloat(document.getElementById("interesMensual").value);
  const valorUF = parseFloat(document.getElementById("valorUF").value.replace(/\./g, '').replace(',', '.'));

  const abono = valorParcela * (porcentajePie / 100);
  const saldoFinanciar = valorParcela - abono;
  const totalConIntereses = saldoFinanciar * Math.pow(1 + interesMensual / 100, cuotas);
  const valorCuota = totalConIntereses / cuotas;
  const totalParcela = abono + totalConIntereses;

  const resultadoHTML = `
    <h2>Resumen de Simulación</h2>
    <table>
      <tr><th>Concepto</th><th>CLP</th><th>UF</th></tr>
      <tr><td>Valor Parcela</td><td>${formatCLP(valorParcela)}</td><td>${formatUF(valorParcela / valorUF)}</td></tr>
      <tr><td>Abono o Pie</td><td>${formatCLP(abono)}</td><td>${formatUF(abono / valorUF)}</td></tr>
      <tr><td>Saldo a Financiar</td><td>${formatCLP(saldoFinanciar)}</td><td>${formatUF(saldoFinanciar / valorUF)}</td></tr>
      <tr><td>Número de Cuotas</td><td>${cuotas}</td><td>—</td></tr>
      <tr><td>Valor Cuota</td><td>${formatCLP(valorCuota)}</td><td>${formatUF(valorCuota / valorUF)}</td></tr>
      <tr><td>Total Cuotas con Intereses</td><td>${formatCLP(totalConIntereses)}</td><td>${formatUF(totalConIntereses / valorUF)}</td></tr>
      <tr><td>Valor Total Parcela</td><td>${formatCLP(totalParcela)}</td><td>${formatUF(totalParcela / valorUF)}</td></tr>
    </table>
  `;

  document.getElementById("resultado").innerHTML = resultadoHTML;
});