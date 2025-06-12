import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import {
    Box, TextField, Button, CircularProgress, Alert, Typography, Paper, Snackbar,
    MenuItem, Autocomplete, InputAdornment
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale/es';
import type { SalesOrderSummary } from '../../../types/salesOrder.types';
import type { PurchaseOrderSummary } from '../../../types/purchaseOrder.types';
import { getAllSalesOrders } from '../../../api/salesOrderService';
import { getAllPurchaseOrders } from '../../../api/purchaseOrderService';
import { useNavigate } from 'react-router-dom';

interface FormInputs {
    tipoTransaccion: 'Pago' | 'Cobro';
    ordenVenta?: SalesOrderSummary | null;
    ordenCompra?: PurchaseOrderSummary | null;
    fechaPagoCobro: Date | null;
    metodoPago: string;
    montoTransaccion?: number;
    referenciaTransaccion?: string | null;
    estadoTransaccion: 'Pendiente' | 'Pagado' | 'Cobrado' | 'Anulado';
    observacionesTransaccion?: string | null;
}

const PaymentReceiptCreateForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [salesOrders, setSalesOrders] = useState<SalesOrderSummary[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderSummary[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [localTipoTransaccion, setLocalTipoTransaccion] = useState<FormInputs['tipoTransaccion']>('Cobro');
    const [localOrdenVenta, setLocalOrdenVenta] = useState<SalesOrderSummary | null>(null);
    const [localOrdenCompra, setLocalOrdenCompra] = useState<PurchaseOrderSummary | null>(null);
    const [localFechaPagoCobro, setLocalFechaPagoCobro] = useState<Date | null>(new Date());
    const [localMetodoPago, setLocalMetodoPago] = useState('Transferencia Bancaria');
    const [localMontoTransaccion, setLocalMontoTransaccion] = useState<number | undefined>(undefined);
    const [localReferenciaTransaccion, setLocalReferenciaTransaccion] = useState<string | null>('');
    const [localEstadoTransaccion, setLocalEstadoTransaccion] = useState<FormInputs['estadoTransaccion']>('Pendiente');
    const [localObservacionesTransaccion, setLocalObservacionesTransaccion] = useState<string | null>('');

    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
    } = useForm<FormInputs>({
        defaultValues: {
            tipoTransaccion: 'Cobro',
            ordenVenta: null,
            ordenCompra: null,
            fechaPagoCobro: new Date(),
            metodoPago: 'Transferencia Bancaria',
            estadoTransaccion: 'Pendiente',
            observacionesTransaccion: '',
            referenciaTransaccion: '',
            montoTransaccion: undefined,
        }
    });

    const tipoTransaccionWatched = watch('tipoTransaccion');

    const loadSalesOrders = useCallback(async () => {
        setOrdersLoading(true);
        try {
            const response = await getAllSalesOrders({ size: 1000, sort: 'fechaPedido,desc' });
            setSalesOrders(response.content.map(so => ({
                idOrdenVenta: so.idOrdenVenta,
                clienteNombre: so.cliente.nombreCliente,
                fechaPedido: so.fechaPedido,
            })));
        } catch (err) { console.error("Error cargando órdenes de venta:", err); }
        finally { setOrdersLoading(false); }
    }, []);

    const loadPurchaseOrders = useCallback(async () => {
        setOrdersLoading(true);
        try {
            const response = await getAllPurchaseOrders({ size: 1000, sort: 'fechaPedidoCompra,desc' });
            setPurchaseOrders(response.content.map(po => ({
                idOrdenCompra: po.idOrdenCompra,
                proveedorNombre: po.proveedor.nombreComercialProveedor,
                fechaPedidoCompra: po.fechaPedidoCompra,
            })));
        } catch (err) { console.error("Error cargando órdenes de compra:", err); }
        finally { setOrdersLoading(false); }
    }, []);

    useEffect(() => {
        if (tipoTransaccionWatched === 'Cobro') {
            loadSalesOrders();
            setValue('ordenCompra', null);
            setLocalOrdenCompra(null);
        } else if (tipoTransaccionWatched === 'Pago') {
            loadPurchaseOrders();
            setValue('ordenVenta', null);
            setLocalOrdenVenta(null);
        }
    }, [tipoTransaccionWatched, loadSalesOrders, loadPurchaseOrders, setValue]);

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setLoading(true);
        setFormError(null);
        setValidationErrors({});

        const currentValidationErrors: { [key: string]: string } = {};
        if (!localTipoTransaccion) {
            currentValidationErrors.tipoTransaccion = 'El tipo de transacción es requerido.';
        }
        if (localTipoTransaccion === 'Cobro' && !localOrdenVenta) {
            currentValidationErrors.ordenVenta = 'Debe seleccionar una Orden de Venta para un Cobro.';
        }
        if (localTipoTransaccion === 'Pago' && !localOrdenCompra) {
            currentValidationErrors.ordenCompra = 'Debe seleccionar una Orden de Compra para un Pago.';
        }
        if (!localFechaPagoCobro) {
            currentValidationErrors.fechaPagoCobro = 'La fecha es requerida.';
        } else if (localFechaPagoCobro > new Date()) {
            currentValidationErrors.fechaPagoCobro = 'La fecha no puede ser futura.';
        }
        if (!localMetodoPago) {
            currentValidationErrors.metodoPago = 'El método de pago es requerido.';
        } else if (localMetodoPago.length > 50) {
            currentValidationErrors.metodoPago = 'El método de pago no puede tener más de 50 caracteres.';
        }
        if (!localMontoTransaccion) {
            currentValidationErrors.montoTransaccion = 'El monto es requerido.';
        } else if (localMontoTransaccion <= 0) {
            currentValidationErrors.montoTransaccion = 'El monto debe ser mayor a 0.';
        } else if (!/^\d+(\.\d{0,2})?$/.test(String(localMontoTransaccion))) {
            currentValidationErrors.montoTransaccion = 'Máximo 2 decimales permitidos.';
        }
        if (localReferenciaTransaccion && localReferenciaTransaccion.length > 100) {
            currentValidationErrors.referenciaTransaccion = 'La referencia no puede tener más de 100 caracteres.';
        }
        if (!localEstadoTransaccion) {
            currentValidationErrors.estadoTransaccion = 'El estado es requerido.';
        }
        if (localObservacionesTransaccion && localObservacionesTransaccion.length > 500) {
            currentValidationErrors.observacionesTransaccion = 'Las observaciones no pueden tener más de 500 caracteres.';
        }

        setValidationErrors(currentValidationErrors);

            if (Object.keys(currentValidationErrors).length > 0) {
                setLoading(false);
                return;
            }
        };

    const handleCloseSnackbar = () => setSnackbarOpen(false);
    const tipoTransaccionOptions: Array<FormInputs['tipoTransaccion']> = ['Cobro', 'Pago'];
    const metodoPagoOptions = ['Efectivo', 'Transferencia Bancaria', 'Cheque', 'Tarjeta Crédito', 'Tarjeta Débito', 'PSE', 'Otro'];
    const estadoTransaccionOptions: Array<FormInputs['estadoTransaccion']> = ['Pendiente', 'Pagado', 'Cobrado', 'Anulado'];

    const handleTipoTransaccionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTipoTransaccion(event.target.value as FormInputs['tipoTransaccion']);
        setValue('tipoTransaccion', event.target.value as FormInputs['tipoTransaccion']);
    };

    const handleOrdenVentaChange = (_: any, newValue: SalesOrderSummary | null, fieldOnChange?: (value: any) => void) => {
        setLocalOrdenVenta(newValue);
        if (fieldOnChange) fieldOnChange(newValue);
    };

    const handleOrdenCompraChange = (_: any, newValue: PurchaseOrderSummary | null, fieldOnChange?: (value: any) => void) => {
        setLocalOrdenCompra(newValue);
        if (fieldOnChange) fieldOnChange(newValue);
    };

    const handleFechaPagoCobroChange = (date: Date | null) => {
        setLocalFechaPagoCobro(date);
    };

    const handleMetodoPagoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalMetodoPago(event.target.value);
    };

    const handleMontoTransaccionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalMontoTransaccion(Number(event.target.value) || undefined);
    };

    const handleReferenciaTransaccionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalReferenciaTransaccion(event.target.value);
    };

    const handleEstadoTransaccionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalEstadoTransaccion(event.target.value as FormInputs['estadoTransaccion']);
    };

    const handleObservacionesTransaccionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalObservacionesTransaccion(event.target.value);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Typography variant="h6" component="h2" gutterBottom>
                    Registrar Nuevo Pago o Cobro
                </Typography>
                {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}

                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                        <TextField select required fullWidth label="Tipo de Transacción" value={localTipoTransaccion} onChange={handleTipoTransaccionChange} error={!!validationErrors.tipoTransaccion} helperText={validationErrors.tipoTransaccion} disabled={loading}>
                            {tipoTransaccionOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Box>

                    {localTipoTransaccion === 'Cobro' && (
                        <Box>
                            <Controller
                                name="ordenVenta"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        options={salesOrders}
                                        loading={ordersLoading}
                                        getOptionLabel={(option) => option ? `OV #${option.idOrdenVenta} - ${option.clienteNombre}` : ''}
                                        isOptionEqualToValue={(option, value) => option?.idOrdenVenta === value?.idOrdenVenta}
                                        value={
                                            salesOrders.find(so => so.idOrdenVenta === localOrdenVenta?.idOrdenVenta) || null
                                        }
                                        onChange={(_, newValue) => handleOrdenVentaChange(_, newValue, field.onChange)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Orden de Venta Asociada"
                                                error={!!validationErrors.ordenVenta}
                                                helperText={validationErrors.ordenVenta}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Box>
                    )}

                    {localTipoTransaccion === 'Pago' && (
                        <Box>
                            <Controller
                                name="ordenCompra"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        options={purchaseOrders}
                                        loading={ordersLoading}
                                        getOptionLabel={(option) => option ? `OC #${option.idOrdenCompra} - ${option.proveedorNombre}` : ''}
                                        isOptionEqualToValue={(option, value) => option?.idOrdenCompra === value?.idOrdenCompra}
                                        value={
                                            purchaseOrders.find(po => po.idOrdenCompra === localOrdenCompra?.idOrdenCompra) || null
                                        }
                                        onChange={(_, newValue) => handleOrdenCompraChange(_, newValue, field.onChange)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Orden de Compra Asociada"
                                                error={!!validationErrors.ordenCompra}
                                                helperText={validationErrors.ordenCompra}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Box>
                    )}

                    <Box>
                        <DatePicker label="Fecha Pago/Cobro *" value={localFechaPagoCobro} onChange={handleFechaPagoCobroChange}
                            maxDate={new Date()}
                            slotProps={{ textField: { fullWidth: true, error: !!validationErrors.fechaPagoCobro, helperText: validationErrors.fechaPagoCobro, InputLabelProps:{shrink:true} } }} disabled={loading}/>
                    </Box>
                    <Box>
                        <TextField required fullWidth label="Método de Pago" select value={localMetodoPago} onChange={handleMetodoPagoChange} error={!!validationErrors.metodoPago} helperText={validationErrors.metodoPago} disabled={loading}>
                            {metodoPagoOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Box>
                    <Box>
                        <TextField required fullWidth label="Monto Transacción" type="number"
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, inputProps: { step: "0.01", min: 0.01 } }}
                            value={localMontoTransaccion ?? ''}
                            onChange={handleMontoTransaccionChange}
                            error={!!validationErrors.montoTransaccion}
                            helperText={validationErrors.montoTransaccion}
                            disabled={loading}/>
                    </Box>
                    <Box>
                        <TextField fullWidth label="Referencia (Opcional)" value={localReferenciaTransaccion ?? ''} onChange={handleReferenciaTransaccionChange} error={!!validationErrors.referenciaTransaccion} helperText={validationErrors.referenciaTransaccion} disabled={loading}/>
                    </Box>
                    <Box>
                        <TextField required fullWidth label="Estado Transacción" select value={localEstadoTransaccion} onChange={handleEstadoTransaccionChange} error={!!validationErrors.estadoTransaccion} helperText={validationErrors.estadoTransaccion} disabled={loading}>
                            {estadoTransaccionOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                        </TextField>
                    </Box>
                    <Box>
                        <TextField fullWidth label="Observaciones (Opcional)" multiline rows={2} value={localObservacionesTransaccion ?? ''} onChange={handleObservacionesTransaccionChange} error={!!validationErrors.observacionesTransaccion} helperText={validationErrors.observacionesTransaccion} disabled={loading}/>
                    </Box>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate('/pagos-cobros')} disabled={loading}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading || ordersLoading} startIcon={loading ? <CircularProgress size={20} /> : null}>
                        {loading ? 'Registrando...' : 'Registrar'}
                    </Button>
                </Box>
            </Box>
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
        </LocalizationProvider>
    );
};

export default PaymentReceiptCreateForm;