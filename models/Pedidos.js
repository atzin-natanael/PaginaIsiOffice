import { DataTypes } from 'sequelize'
import db from '../config/db.js'

const pedido = db.define('DOCTOS_PED', {
    PEDIDO_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    CLIENTE_ID: { //FK
        type: DataTypes.INTEGER,
        allowNull: false
    },
    COSTO_TOTAL: { 
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
    },
    DESCRIPCION: { 
    type: DataTypes.STRING(200),
    allowNull: false
    },
    ESTATUS: {
        type: DataTypes.ENUM('PENDIENTE', 'ENVIADO', 'CANCELADO'),
        defaultValue: 'PENDIENTE'
    },
    METODO_DE_PAGO: { 
    type: DataTypes.STRING,
    allowNull: false
    },
    FORMA_DE_PAGO: { 
    type: DataTypes.STRING,
    allowNull: false
    },
    USO_DE_CFDI: { 
    type: DataTypes.STRING,
    allowNull: false
    },
    COMENTARIOS: { 
    type: DataTypes.STRING,
    allowNull: false
    },
    PORCENTAJE_DESCUENTO: { //FK
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
}, {
    timestamps: true
})

export default pedido
