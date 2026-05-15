import { PrismaClient } from "../generated/prisma";
import { hash } from "bcryptjs";
import { StatusEnum } from "../src/models/status.enum";

const prisma = new PrismaClient();

async function main() {
  const seedId = `[seed:${new Date().toISOString().split("T")[0]}]`;

  const rolesData = ["admin", "curador", "investigador", "visitante"];
  const existingRoles = await prisma.rol.count();
  if (existingRoles === 0) {
    const { count } = await prisma.rol.createMany({
      data: rolesData.map((nombre) => ({ nombre })),
    });
    console.log(`${seedId} Roles: ${count} creados`);
  }

  const estadosData = Object.values(StatusEnum);
  const existingEstados = await prisma.estado.count();
  if (existingEstados === 0) {
    const { count } = await prisma.estado.createMany({
      data: estadosData.map((nombre) => ({ nombre })),
    });
    console.log(`${seedId} Estados: ${count} creados`);
  }

  const mediosData = ["audio", "video", "texto", "imagen"];
  const existingMedios = await prisma.medio.count();
  if (existingMedios === 0) {
    const { count } = await prisma.medio.createMany({
      data: mediosData.map((nombre) => ({ nombre })),
    });
    console.log(`${seedId} Medios: ${count} creados`);
  }

  const categoriasData = [
    {
      nombre: "Historia Oral",
      descripcion: "Testimonios transmitidos de forma oral por generaciones",
    },
    {
      nombre: "Memoria Colectiva",
      descripcion:
        "Relatos que reflejan la memoria y experiencia de una comunidad",
    },
    {
      nombre: "Patrimonio Cultural",
      descripcion: "Manifestaciones culturales y tradiciones vigentes",
    },
    {
      nombre: "Derechos Humanos",
      descripcion:
        "Testimonios relacionados con la defensa de derechos fundamentales",
    },
    {
      nombre: "Historia de Vida",
      descripcion: "Relatos biográficos y trayectorias personales",
    },
    {
      nombre: "Saberes Ancestrales",
      descripcion: "Conocimientos y prácticas tradicionales",
    },
  ];
  const existingCategorias = await prisma.categorias.count();
  if (existingCategorias === 0) {
    const { count } = await prisma.categorias.createMany({
      data: categoriasData,
    });
    console.log(`${seedId} Categorías: ${count} creadas`);
  }

  const etiquetasData = [
    "indígena",
    "migración",
    "resistencia",
    "tradición",
    "memoria",
    "identidad",
    "territorio",
    "mujer",
    "juventud",
    "lengua",
  ];
  const existingEtiquetas = await prisma.etiquetas.count();
  if (existingEtiquetas === 0) {
    const { count } = await prisma.etiquetas.createMany({
      data: etiquetasData.map((nombre) => ({ nombre })),
    });
    console.log(`${seedId} Etiquetas: ${count} creadas`);
  }

  const eventosData = [
    {
      nombre: "Guerra del Chaco",
      descripcion: "Conflicto bélico entre Bolivia y Paraguay (1932-1935) por el control del Chaco Boreal. Una de las guerras más significativas de Sudamérica en el siglo XX.",
      fecha: new Date("1932-06-15"),
    },
    {
      nombre: "Revolución Nacional de 1952",
      descripcion: "Revolución liderada por el MNR que transformó la estructura política, social y económica de Bolivia, incluyendo la reforma agraria y la nacionalización de las minas.",
      fecha: new Date("1952-04-09"),
    },
    {
      nombre: "Masacre de Octubre Negra",
      descripcion: "Serie de violentos enfrentamientos en La Paz y El Alto en octubre de 2003 contra la exportación de gas por Chile, que resultó en más de 60 muertos y la renuncia del presidente Sánchez de Lozada.",
      fecha: new Date("2003-10-12"),
    },
    {
      nombre: "Fundación de La Paz",
      descripcion: "Fundación de Nuestra Señora de La Paz por el capitán español Alonso de Mendoza el 20 de octubre de 1548, actual sede de gobierno de Bolivia.",
      fecha: new Date("1548-10-20"),
    },
    {
      nombre: "Independencia de Bolivia",
      descripcion: "Proclamación de la independencia del Alto Perú, hoy Bolivia, el 6 de agosto de 1825, tras la lucha libertadora liderada por Simón Bolívar y Antonio José de Sucre.",
      fecha: new Date("1825-08-06"),
    },
    {
      nombre: "Guerra del Pacífico",
      descripcion: "Conflicto armado entre Bolivia y la alianza de Chile contra Perú (1879-1884) que resultó en la pérdida del departamento del Litoral y la salida soberana al mar para Bolivia.",
      fecha: new Date("1879-02-14"),
    },
    {
      nombre: "Masacre de San Juan",
      descripcion: "Represión militar durante la dictadura de Hugo Banzer en 1979 en las cercanías de La Paz, donde fueron asesinados más de 20 campesinos y mineros.",
      fecha: new Date("1979-06-29"),
    },
    {
      nombre: "Marcha por el Territorio y la Dignidad",
      descripcion: "Histórica marcha de los pueblos indígenas del oriente boliviano en 1990 desde Trinidad hasta La Paz para reivindicar sus derechos territoriales y el reconocimiento de sus territorios ancestrales.",
      fecha: new Date("1990-08-15"),
    },
    {
      nombre: "Guerra Federal",
      descripcion: "Conflicto civil entre liberales y conservadores a finales del siglo XIX que definió el traslado del poder político a La Paz y el inicio del periodo liberal en Bolivia.",
      fecha: new Date("1898-11-06"),
    },
    {
      nombre: "Nacionalización de los Hidrocarburos",
      descripcion: "Decreto promulgado por el presidente Evo Morales el 1 de mayo de 2006 que nacionalizó los recursos de hidrocarburos, recuperando el control estatal sobre YPFB y los recursos gasíferos del país.",
      fecha: new Date("2006-05-01"),
    },
    {
      nombre: "Batalla de Ingavi",
      descripcion: "Enfrentamiento decisivo el 18 de noviembre de 1841 donde el ejército boliviano al mando del general José Ballivián derrotó a las fuerzas peruanas, consolidando la independencia y soberanía nacional.",
      fecha: new Date("1841-11-18"),
    },
    {
      nombre: "Creación de la República de Bolivia",
      descripcion: "La Asamblea Deliberante reunida en Chuquisaca declaró oficialmente la creación de la República de Bolivia el 11 de agosto de 1825, nombrada en honor a Simón Bolívar.",
      fecha: new Date("1825-08-11"),
    },
    {
      nombre: "Asamblea Constituyente 2006-2007",
      descripcion: "Proceso constituyente convocado por el gobierno de Evo Morales que redactó la nueva Constitución Política del Estado, aprobada en referéndum en 2009, reconociendo el carácter plurinacional de Bolivia.",
      fecha: new Date("2006-08-06"),
    },
    {
      nombre: "Gobierno de Evo Morales",
      descripcion: "Primer presidente indígena de Bolivia (2006-2019). Su gobierno impulsó políticas de nacionalización, inclusión social y reconocimiento de los derechos indígenas, transformando la economía y la estructura política del país.",
      fecha: new Date("2006-01-22"),
    },
    {
      nombre: "Masacre de Tolata y Epizana",
      descripcion: "Represión militar durante el gobierno de facto de Luis García Meza en enero de 1981 contra campesinos del valle cochabambino que protestaban por la carestía de la canasta familiar.",
      fecha: new Date("1981-01-15"),
    },
    {
      nombre: "Constitución Política del Estado 2009",
      descripcion: "Aprobada mediante referéndum el 25 de enero de 2009, la nueva Constitución refundó Bolivia como Estado Unitario Social de Derecho Plurinacional Comunitario, reconociendo 36 naciones indígenas originarias.",
      fecha: new Date("2009-01-25"),
    },
    {
      nombre: "Censo Nacional 2012",
      descripcion: "Censo de población y vivienda realizado el 21 de noviembre de 2012 que registró más de 10 millones de habitantes en Bolivia, evidenciando el crecimiento demográfico y los cambios en la distribución poblacional.",
      fecha: new Date("2012-11-21"),
    },
    {
      nombre: "Caída del Goni y Guerra del Gas",
      descripcion: "Estallido social en septiembre-octubre de 2003 contra el proyecto de exportación de gas natural por puertos chilenos. Las masivas protestas culminaron con la renuncia del presidente Gonzalo Sánchez de Lozada y más de 70 muertos en todo el país.",
      fecha: new Date("2003-09-15"),
    },
    {
      nombre: "Masacre de Catavi",
      descripcion: "Represión a mineros en la mina de Catavi (Potosí) el 21 de diciembre de 1942 durante el gobierno de Enrique Peñaranda, donde fuerzas militares dispararon contra trabajadores que reclamaban mejoras salariales, dejando cientos de muertos.",
      fecha: new Date("1942-12-21"),
    },
    {
      nombre: "Federación de Mineros de Bolivia",
      descripcion: "Fundación de la Federación Sindical de Trabajadores Mineros de Bolivia (FSTMB) en 1944, organización que jugó un papel central en la historia del movimiento obrero boliviano y la Revolución de 1952.",
      fecha: new Date("1944-06-11"),
    },
  ];
  const existingEventos = await prisma.eventos_historicos.count();
  if (existingEventos === 0) {
    const { count } = await prisma.eventos_historicos.createMany({
      data: eventosData,
    });
    console.log(`${seedId} Eventos Históricos: ${count} creados`);
  }

  const admin = await prisma.usuarios.findFirst({
    where: { email: "admin@testimonios.app" },
  });

  if (!admin) {
    const hashedPassword = await hash("admin123", 10);
    await prisma.usuarios.create({
      data: {
        nombre: "Admin",
        email: "admin@testimonios.app",
        password: hashedPassword,
        biografia: "Administrador del sistema",
        two_factor_secret: "",
        last_login: new Date(),
        id_rol: 1,
      },
    });
    console.log(`${seedId} Admin creado: admin@testimonios.app / admin123`);
  }

  console.log(`${seedId} Seed completado exitosamente`);
}

main()
  .catch((e) => {
    console.error("Seed falló:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
