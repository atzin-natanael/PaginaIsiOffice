import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const ArticulosPedido = db.define('DOCTOS_PED_DET', {
    ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    PEDIDO_ID: { //FK
    type: DataTypes.INTEGER,
    allowNull: false
    },
    ART_ID: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    CLAVE_ARTICULO: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PRECIO: { // Precio de lista unitario
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    CANTIDAD: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DESCUENTO: { // Monto restado (puede ser por unidad o total de la línea)
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    IMPUESTO: { // Monto de IVA aplicado a esta línea
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    IMPORTE: { // (Precio * Cantidad) - Descuento + Impuesto
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    IMPORTE_TOTAL: { // (Precio * Cantidad) - Descuento + Impuesto
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'DOCTOS_PED_DET',
    freezeTableName: true,
    timestamps: false
})

export default ArticulosPedido
