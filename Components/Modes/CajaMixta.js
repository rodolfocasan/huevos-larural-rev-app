// Components/Modes/CajaMixta.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../Utils/Constants';





// Obtener dimensiones de la pantalla para responsive design
const { width } = Dimensions.get('window');

function CajaMixta({ businessConfig }) {
  // Estado para los tipos de huevos
  const [tiposHuevos, setTiposHuevos] = useState({
    tipo_01: { precio_compra_caja: 41.00, volumen_esperado: 9, nombre: 'Tipo 1' },
    tipo_02: { precio_compra_caja: 45.00, volumen_esperado: 9, nombre: 'Tipo 2' }
  });

  // Estado para los resultados de cálculo
  const [resultados, setResultados] = useState(null);

  // Estados para el modal de agregar tipo
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState('');
  const [nuevoTipoPrecio, setNuevoTipoPrecio] = useState('');
  const [nuevoTipoVolumen, setNuevoTipoVolumen] = useState('');

  // Estados para el modal de editar tipo
  const [modalEditarVisible, setModalEditarVisible] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [editarTipoNombre, setEditarTipoNombre] = useState('');
  const [editarTipoPrecio, setEditarTipoPrecio] = useState('');
  const [editarTipoVolumen, setEditarTipoVolumen] = useState('');

  // Calcular total de gastos semanales
  const totalGastosSemanales = Object.values(businessConfig.gastos_totales_semanales).reduce((a, b) => a + b, 0);

  // Efecto para recalcular cuando cambian los datos
  useEffect(() => {
    calcularPrecios();
  }, [tiposHuevos, businessConfig]);

  // Función para actualizar un tipo de huevo
  const actualizarTipo = (tipo, campo, valor) => {
    setTiposHuevos(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [campo]: campo === 'nombre' ? valor : (parseFloat(valor) || 0)
      }
    }));
  };

  // Función para eliminar un tipo de huevo
  const eliminarTipo = (tipo) => {
    const tiposActuales = Object.keys(tiposHuevos);
    if (tiposActuales.length <= 2) {
      Alert.alert('Error', 'Debe mantener al menos 2 tipos de huevos para el cartón mixto');
      return;
    }

    Alert.alert(
      'Confirmar eliminación',
      `¿Está seguro de eliminar ${tiposHuevos[tipo].nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const nuevosTipos = { ...tiposHuevos };
            delete nuevosTipos[tipo];
            setTiposHuevos(nuevosTipos);
          }
        }
      ]
    );
  };

  // Función principal de cálculo
  const calcularPrecios = () => {
    const cantidadTipos = Object.keys(tiposHuevos).length;
    const totalHuevosPorCarton = 30;

    // Distribución equitativa de huevos en el cartón mixto
    const huevosBasePorTipo = Math.floor(totalHuevosPorCarton / cantidadTipos);
    const huevosRestantes = totalHuevosPorCarton % cantidadTipos;

    let distribucionHuevos = {};
    let costosCompra = {};
    let huevosDisponibles = {};
    let costoCompraTotal = 0;

    // Calcular para cada tipo de huevo
    Object.entries(tiposHuevos).forEach(([tipo, params], index) => {
      // Distribución de huevos en el cartón mixto
      const huevosEnMixto = huevosBasePorTipo + (index < huevosRestantes ? 1 : 0);
      distribucionHuevos[tipo] = huevosEnMixto;

      // Costo de compra por tipo
      const costoTipo = params.precio_compra_caja * params.volumen_esperado;
      costosCompra[tipo] = costoTipo;
      costoCompraTotal += costoTipo;

      // Huevos disponibles por tipo (cajas * cartones por caja * huevos por cartón)
      const cartonesDisponibles = params.volumen_esperado * 12;
      huevosDisponibles[tipo] = cartonesDisponibles * 30;
    });

    // Cálculos financieros
    const costoTotalSemanal = costoCompraTotal + totalGastosSemanales;
    const ingresosNecesarios = costoTotalSemanal + businessConfig.ganancia_minima_semanal;

    // Calcular límites de producción por tipo
    const limitesPorTipo = {};
    Object.keys(tiposHuevos).forEach(tipo => {
      limitesPorTipo[tipo] = Math.floor(huevosDisponibles[tipo] / distribucionHuevos[tipo]);
    });

    // El límite total es el menor de todos los tipos
    const totalCartonesMixtos = Math.min(...Object.values(limitesPorTipo));
    const precioMinimoPorCartonMixto = parseFloat((ingresosNecesarios / totalCartonesMixtos).toFixed(2));

    // Cálculos finales
    const ingresoTotal = totalCartonesMixtos * precioMinimoPorCartonMixto;
    const gananciaTotal = ingresoTotal - costoTotalSemanal;

    // Detalles por tipo
    const detallesPorTipo = {};
    Object.entries(tiposHuevos).forEach(([tipo, params]) => {
      const huevosUsados = totalCartonesMixtos * distribucionHuevos[tipo];
      const cartonesUsados = Math.ceil(huevosUsados / 30);
      const cajasUsadas = Math.ceil(cartonesUsados / 12);
      const huevosSobrantes = huevosDisponibles[tipo] - huevosUsados;

      detallesPorTipo[tipo] = {
        huevosUsados,
        cartonesUsados,
        cajasUsadas,
        huevosSobrantes,
        costoUnitario: params.precio_compra_caja / 360, // Costo por huevo
        costoTotalUsado: huevosUsados * (params.precio_compra_caja / 360)
      };
    });

    setResultados({
      distribucionHuevos,
      costosCompra,
      costoCompraTotal,
      costoTotalSemanal,
      totalCartonesMixtos,
      precioMinimoPorCartonMixto,
      ingresoTotal,
      gananciaTotal,
      limitesPorTipo,
      detallesPorTipo,
      huevosDisponibles,
      cumpleMinimo: gananciaTotal >= businessConfig.ganancia_minima_semanal
    });
  };

  // Función para abrir modal de agregar tipo
  const abrirModalAgregarTipo = () => {
    setNuevoTipoNombre('');
    setNuevoTipoPrecio('');
    setNuevoTipoVolumen('');
    setModalVisible(true);
  };

  // Función para cancelar agregar tipo
  const cancelarAgregarTipo = () => {
    setModalVisible(false);
    setNuevoTipoNombre('');
    setNuevoTipoPrecio('');
    setNuevoTipoVolumen('');
  };

  // Función para agregar nuevo tipo
  const agregarNuevoTipo = () => {
    if (!nuevoTipoNombre.trim()) {
      Alert.alert('Error', 'Ingrese un nombre para el tipo de huevo');
      return;
    }
    if (!nuevoTipoPrecio || parseFloat(nuevoTipoPrecio) <= 0) {
      Alert.alert('Error', 'Ingrese un precio válido por caja');
      return;
    }
    if (!nuevoTipoVolumen || parseFloat(nuevoTipoVolumen) <= 0) {
      Alert.alert('Error', 'Ingrese un volumen válido de cajas por semana');
      return;
    }

    // Generar nuevo ID para el tipo
    const tiposExistentes = Object.keys(tiposHuevos);
    const numerosTipos = tiposExistentes.map(tipo => parseInt(tipo.split('_')[1]));
    const siguienteNumero = Math.max(...numerosTipos) + 1;
    const nuevoTipoId = `tipo_${siguienteNumero.toString().padStart(2, '0')}`;

    // Agregar el nuevo tipo
    setTiposHuevos(prev => ({
      ...prev,
      [nuevoTipoId]: {
        precio_compra_caja: parseFloat(nuevoTipoPrecio),
        volumen_esperado: parseFloat(nuevoTipoVolumen),
        nombre: nuevoTipoNombre.trim()
      }
    }));

    setModalVisible(false);
    setNuevoTipoNombre('');
    setNuevoTipoPrecio('');
    setNuevoTipoVolumen('');
  };

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return `$${parseFloat(valor).toFixed(2)}`;
  };

  // Función para abrir modal de editar tipo
  const abrirModalEditarTipo = (tipo) => {
    setTipoEditando(tipo);
    setEditarTipoNombre(tiposHuevos[tipo].nombre);
    setEditarTipoPrecio(tiposHuevos[tipo].precio_compra_caja.toFixed(2));
    setEditarTipoVolumen(tiposHuevos[tipo].volumen_esperado.toString());
    setModalEditarVisible(true);
  };

  // Función para cancelar editar tipo
  const cancelarEditarTipo = () => {
    setModalEditarVisible(false);
    setTipoEditando(null);
    setEditarTipoNombre('');
    setEditarTipoPrecio('');
    setEditarTipoVolumen('');
  };

  // Función para guardar cambios del tipo
  const guardarCambiosTipo = () => {
    if (!editarTipoNombre.trim()) {
      Alert.alert('Error', 'Ingrese un nombre para el tipo de huevo');
      return;
    }
    if (!editarTipoPrecio || parseFloat(editarTipoPrecio) <= 0) {
      Alert.alert('Error', 'Ingrese un precio válido por caja');
      return;
    }
    if (!editarTipoVolumen || parseFloat(editarTipoVolumen) <= 0) {
      Alert.alert('Error', 'Ingrese un volumen válido de cajas por semana');
      return;
    }

    // Actualizar el tipo con los nuevos valores
    setTiposHuevos(prev => ({
      ...prev,
      [tipoEditando]: {
        ...prev[tipoEditando],
        nombre: editarTipoNombre.trim(),
        precio_compra_caja: parseFloat(editarTipoPrecio),
        volumen_esperado: parseFloat(editarTipoVolumen)
      }
    }));

    setModalEditarVisible(false);
    setTipoEditando(null);
    setEditarTipoNombre('');
    setEditarTipoPrecio('');
    setEditarTipoVolumen('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parámetros de compra</Text>
            <TouchableOpacity style={styles.addButton} onPress={abrirModalAgregarTipo}>
              <Text style={styles.addButtonText}>(+) Añadir tipo</Text>
            </TouchableOpacity>
          </View>

          {Object.entries(tiposHuevos).map(([tipo, params]) => (
            <View key={tipo} style={styles.tipoCard}>
              <View style={styles.tipoHeader}>
                <Text style={styles.tipoNameDisplay}>{params.nombre}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => eliminarTipo(tipo)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tipoContent}>
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}> Precio por caja:</Text>
                    <View style={styles.displayWrapper}>
                      <Text style={styles.displayValue}>{formatearMoneda(params.precio_compra_caja)}</Text>
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}> Cajas por semana:</Text>
                    <View style={styles.displayWrapper}>
                      <Text style={styles.displayValue}>{params.volumen_esperado}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.tipoStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Costo semanal</Text>
                    <Text style={styles.statValue}>{formatearMoneda(params.precio_compra_caja * params.volumen_esperado)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Huevos disponibles</Text>
                    <Text style={styles.statValue}>{(params.volumen_esperado * 12 * 30).toLocaleString()}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => abrirModalEditarTipo(tipo)}
                >
                  <Text style={styles.editButtonText}>✏️ Editar información</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Modal para editar tipo existente */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalEditarVisible}
            onRequestClose={cancelarEditarTipo}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>✏️ Editar Tipo de Huevo</Text>
                  <TouchableOpacity onPress={cancelarEditarTipo} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalInputContainer}>
                    <Text style={styles.modalInputLabel}>Nombre del tipo</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Ej: Huevos Extra, Huevos Premium..."
                      value={editarTipoNombre}
                      onChangeText={setEditarTipoNombre}
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>

                  <View style={styles.modalInputContainer}>
                    <Text style={styles.modalInputLabel}>Precio por caja</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.currencyInput}
                        placeholder="0.00"
                        value={editarTipoPrecio}
                        onChangeText={setEditarTipoPrecio}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.modalInputContainer}>
                    <Text style={styles.modalInputLabel}>Cajas por semana</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0"
                      value={editarTipoVolumen}
                      onChangeText={setEditarTipoVolumen}
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelarEditarTipo}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={guardarCambiosTipo}>
                    <Text style={styles.saveButtonText}>💾 Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        {/* Sección de resultados */}
        {resultados && (
          <>
            {/* Composición del cartón mixto */}
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}> Composición de Cartón Mixto</Text>
              <View style={styles.compositionGrid}>
                {Object.entries(resultados.distribucionHuevos).map(([tipo, cantidad]) => (
                  <View key={tipo} style={styles.compositionCard}>
                    <Text style={styles.compositionType}>{tiposHuevos[tipo].nombre}</Text>
                    <Text style={styles.compositionAmount}>{cantidad}</Text>
                    <Text style={styles.compositionLabel}>huevos</Text>
                    <Text style={styles.compositionPercent}>
                      {((cantidad / 30) * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Precios recomendados */}
            <View style={styles.pricesSection}>
              <Text style={styles.sectionTitle}> Precios Sugeridos</Text>
              <View style={styles.pricesList}>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>1 cartón mixto</Text>
                  <Text style={styles.priceValue}>{formatearMoneda(resultados.precioMinimoPorCartonMixto)}</Text>
                </View>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Media caja mixta (contiene 6 cartones)</Text>
                  <Text style={styles.priceValue}>{formatearMoneda(resultados.precioMinimoPorCartonMixto * 6)}</Text>
                </View>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Una caja mixta (12 cartones)</Text>
                  <Text style={styles.priceValue}>{formatearMoneda(resultados.precioMinimoPorCartonMixto * 12)}</Text>
                </View>
                <View style={styles.priceCard}>
                  <Text style={styles.priceLabel}>Dos cajas mixtas (24 cartones)</Text>
                  <Text style={styles.priceValue}>{formatearMoneda(resultados.precioMinimoPorCartonMixto * 24)}</Text>
                </View>
              </View>
            </View>

            {/* Análisis detallado por tipo */}
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}> Análisis Detallado por Tipo</Text>
              {Object.entries(resultados.detallesPorTipo).map(([tipo, detalles]) => (
                <View key={tipo} style={styles.analysisCard}>
                  <Text style={styles.analysisTitle}>{tiposHuevos[tipo].nombre}</Text>
                  <View style={styles.analysisGrid}>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Huevos usados</Text>
                      <Text style={styles.analysisValue}>{detalles.huevosUsados.toLocaleString()}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Cartones usados</Text>
                      <Text style={styles.analysisValue}>{detalles.cartonesUsados}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Cajas usadas</Text>
                      <Text style={styles.analysisValue}>{detalles.cajasUsadas}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Huevos sobrantes</Text>
                      <Text style={styles.analysisValue}>{detalles.huevosSobrantes.toLocaleString()}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Costo por huevo</Text>
                      <Text style={styles.analysisValue}>{formatearMoneda(detalles.costoUnitario)}</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisLabel}>Costo total usado</Text>
                      <Text style={styles.analysisValue}>{formatearMoneda(detalles.costoTotalUsado)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Resumen financiero */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}> Resumen Financiero Semanal</Text>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryIcon}>💸</Text>
                  <Text style={styles.summaryLabel}>Costo de compra</Text>
                  <Text style={styles.summaryValue}>{formatearMoneda(resultados.costoCompraTotal)}</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryIcon}>🔧</Text>
                  <Text style={styles.summaryLabel}>Gastos operativos</Text>
                  <Text style={styles.summaryValue}>{formatearMoneda(totalGastosSemanales)}</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryIcon}>📦</Text>
                  <Text style={styles.summaryLabel}>Cartones mixtos</Text>
                  <Text style={styles.summaryValue}>{resultados.totalCartonesMixtos}</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryIcon}>💰</Text>
                  <Text style={styles.summaryLabel}>Ingresos totales</Text>
                  <Text style={styles.summaryValue}>{formatearMoneda(resultados.ingresoTotal)}</Text>
                </View>

                <View style={[styles.summaryCard, styles.summaryCardWide]}>
                  <Text style={styles.summaryIcon}>📊</Text>
                  <Text style={styles.summaryLabel}>Ganancia proyectada</Text>
                  <Text style={[
                    styles.summaryValue,
                    { color: resultados.cumpleMinimo ? COLORS.success : COLORS.danger }
                  ]}>
                    {formatearMoneda(resultados.gananciaTotal)}
                  </Text>
                </View>
              </View>

              {/* Banner de estado */}
              <View style={[
                styles.statusBanner,
                {
                  backgroundColor: resultados.cumpleMinimo ?
                    `${COLORS.success}20` : `${COLORS.danger}20`,
                  borderColor: resultados.cumpleMinimo ? COLORS.success : COLORS.danger
                }
              ]}>
                <Text style={styles.statusIcon}>
                  {resultados.cumpleMinimo ? '✅' : '⚠️'}
                </Text>
                <Text style={[
                  styles.statusText,
                  { color: resultados.cumpleMinimo ? COLORS.success : COLORS.danger }
                ]}>
                  {resultados.cumpleMinimo ?
                    `Ganancia mínima cumplida (+${formatearMoneda(resultados.gananciaTotal - businessConfig.ganancia_minima_semanal)})` :
                    `Ganancia insuficiente (${formatearMoneda(businessConfig.ganancia_minima_semanal - resultados.gananciaTotal)} faltante)`
                  }
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Modal para agregar nuevo tipo */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={cancelarAgregarTipo}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🥚 Nuevo Tipo de Huevo</Text>
                <TouchableOpacity onPress={cancelarAgregarTipo} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Nombre del tipo</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Ej: Huevos Extra, Huevos Premium..."
                    value={nuevoTipoNombre}
                    onChangeText={setNuevoTipoNombre}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Precio por caja</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.currencyInput}
                      placeholder="0.00"
                      value={nuevoTipoPrecio}
                      onChangeText={setNuevoTipoPrecio}
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                  </View>
                </View>

                <View style={styles.modalInputContainer}>
                  <Text style={styles.modalInputLabel}>Cajas por semana</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    value={nuevoTipoVolumen}
                    onChangeText={setNuevoTipoVolumen}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={cancelarAgregarTipo}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={agregarNuevoTipo}>
                  <Text style={styles.saveButtonText}>➕ Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Sección de header
  headerSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Sección de inputs
  inputSection: {
    backgroundColor: COLORS.card,
    margin: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Tarjetas de tipos
  tipoCard: {
    backgroundColor: COLORS.secondary,
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipoNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  tipoContent: {
    gap: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 15,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginRight: 5,
  },
  currencyInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  numberInput: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
  },
  tipoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Secciones de resultados
  resultsSection: {
    backgroundColor: COLORS.card,
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compositionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  compositionCard: {
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: (width - 80) / 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compositionType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 5,
    textAlign: 'center',
  },
  compositionAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  compositionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  compositionPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.accent,
    backgroundColor: `${COLORS.accent}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  // Sección de precios
  pricesSection: {
    backgroundColor: COLORS.card,
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pricesList: {
    gap: 12,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    textAlign: 'center',
  },

  // Sección de análisis
  analysisSection: {
    backgroundColor: COLORS.card,
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisCard: {
    backgroundColor: COLORS.secondary,
    padding: 30,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  analysisItem: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: (width - 110) / 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analysisLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Sección de resumen
  summarySection: {
    backgroundColor: COLORS.card,
    margin: 15,
    marginTop: 0,
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: (width - 84) / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryCardWide: {
    minWidth: width - 84,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    gap: 10,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    backgroundColor: COLORS.danger,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    gap: 20,
  },
  modalInputContainer: {
    gap: 8,
  },
  modalInputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tipoNameDisplay: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    textAlign: 'center',
  },
  displayWrapper: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  displayValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  editButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CajaMixta;