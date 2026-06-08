const users = [
  {
    id: 1,
    name: 'Cliente Demo',
    email: 'cliente@localmarket.com',
    password: '123456',
    role: 'cliente',
  },
  {
    id: 2,
    name: 'Tienda Andina',
    email: 'vendedor@localmarket.com',
    password: '123456',
    role: 'vendedor',
  },
];

const categories = [
  'Alimentos',
  'Artesanias',
  'Hogar',
  'Moda',
  'Tecnologia',
];

const products = [
  {
    id: 1,
    vendorId: 2,
    name: 'Cafe especial de origen',
    category: 'Alimentos',
    price: 28000,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
    description: 'Cafe colombiano tostado medio, cultivado por productores locales.',
    status: 'activo',
    location: 'Bogota',
  },
  {
    id: 2,
    vendorId: 2,
    name: 'Mochila artesanal',
    category: 'Artesanias',
    price: 85000,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80',
    description: 'Mochila tejida a mano con fibras resistentes y diseno tradicional.',
    status: 'activo',
    location: 'Santa Marta',
  },
  {
    id: 3,
    vendorId: 2,
    name: 'Set de materas ceramicas',
    category: 'Hogar',
    price: 62000,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',
    description: 'Tres materas en ceramica esmaltada para plantas pequenas.',
    status: 'activo',
    location: 'Medellin',
  },
  {
    id: 4,
    vendorId: 2,
    name: 'Camiseta basica local',
    category: 'Moda',
    price: 45000,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    description: 'Camiseta en algodon, producida por un emprendimiento local.',
    status: 'activo',
    location: 'Cali',
  },
  {
    id: 5,
    vendorId: 2,
    name: 'Lampara de escritorio',
    category: 'Hogar',
    price: 99000,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    description: 'Lampara compacta con acabado en madera y luz calida.',
    status: 'activo',
    location: 'Pereira',
  },
  {
    id: 6,
    vendorId: 2,
    name: 'Soporte para celular',
    category: 'Tecnologia',
    price: 34000,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    description: 'Soporte ajustable para escritorio, ideal para videollamadas.',
    status: 'pausado',
    location: 'Bogota',
  },
];

const orders = [];

module.exports = {
  categories,
  orders,
  products,
  users,
};
