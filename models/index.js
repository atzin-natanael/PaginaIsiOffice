import Lineas from './Lineas.js'
import Categoria from './Categorias.js'
import Articulos from './Articulo.js'
import Usuario from './Usuario.js'
import Clientes from './Clientes.js'
import Cotizacion from './Cotizacion.js'
import ArticulosCotizacion from './ArticulosCotizacion.js'
import DescuentosClientes from './DescuentosClientes.js'
import Pedidos from './Pedidos.js'
import ArticulosPedido from './ArticulosPedido.js'
Articulos.belongsTo(Lineas, {foreignKey: 'LINEA_ID'})
Articulos.belongsTo(Categoria, {foreignKey: 'CATEGORIA_ID'})
Clientes.hasMany(Cotizacion, {foreignKey: 'CLIENTE_ID'})
Cotizacion.belongsTo(Clientes, {foreignKey: 'CLIENTE_ID'})
ArticulosCotizacion.belongsTo(Cotizacion, {foreignKey: 'COTIZACION_ID'})
ArticulosCotizacion.belongsTo(Articulos, {foreignKey: 'ART_ID'})
Articulos.hasMany(ArticulosCotizacion, {foreignKey: 'ART_ID'})
DescuentosClientes.belongsTo(Clientes, {foreignKey: 'CLIENTE_ID'})
Clientes.hasOne(DescuentosClientes, {foreignKey: 'CLIENTE_ID',as: 'DESCUENTO_CLIENTE'})
Usuario.belongsTo(Clientes, {foreignKey: 'CLIENTE_ID'})


Clientes.hasMany(Pedidos, {foreignKey: 'CLIENTE_ID'})
Pedidos.belongsTo(Clientes, {foreignKey: 'CLIENTE_ID'})

Articulos.hasMany(ArticulosPedido, {foreignKey: 'ART_ID'})
ArticulosPedido.belongsTo(Pedidos, {foreignKey: 'PEDIDO_ID'})
ArticulosPedido.belongsTo(Articulos, {foreignKey: 'ART_ID'})

export{
    Articulos,
    Lineas,
    Categoria,
    Usuario,
    Clientes,
    Cotizacion,
    DescuentosClientes
}