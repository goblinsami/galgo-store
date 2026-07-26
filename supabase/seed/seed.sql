insert into products (
  id,
  name,
  slug,
  short_description,
  description,
  category,
  affiliate_url,
  image_url,
  pros,
  cons,
  recommended_for,
  featured,
  published,
  sort_order
) values
(
  '00000000-0000-4000-8000-000000000001',
  'Arnes antiescape de tres puntos',
  'arnes-antiescape-tres-puntos',
  'Arnes pensado para perros estrechos que necesitan un ajuste mas seguro en paseos.',
  'Un arnes de tres puntos puede ayudar a reducir escapes accidentales cuando el ajuste es correcto. Conviene medir cuello, pecho y cintura antes de elegir talla.',
  'arneses',
  'https://www.amazon.es/dp/ASIN_EJEMPLO_1?tag=AFFILIATE_TAG',
  null,
  array['Tres zonas de ajuste', 'Pensado para cuerpos estrechos', 'Util para primeros paseos con supervision'],
  array['Debe ajustarse con cuidado', 'No sustituye una correa bien manejada'],
  'Galgos recien adoptados o perros que tienden a echarse hacia atras en el paseo.',
  true,
  true,
  1
),
(
  '00000000-0000-4000-8000-000000000002',
  'Collar martingale ajustable',
  'collar-martingale-ajustable',
  'Collar de ajuste limitado para cuellos largos, pensado para uso responsable.',
  'El collar martingale ajustable puede ser practico en perros con cuello fino si se regula sin apretar en exceso. La eleccion final depende de medidas y habitos de paseo.',
  'collares',
  'https://www.amazon.es/dp/ASIN_EJEMPLO_2?tag=AFFILIATE_TAG',
  null,
  array['Ajuste limitado', 'Adecuado para cuellos largos', 'Ligero para paseos diarios'],
  array['Requiere supervision', 'No debe usarse para tirones intensos'],
  'Galgos acostumbrados a caminar tranquilos con una sujecion adicional bien ajustada.',
  false,
  true,
  2
),
(
  '00000000-0000-4000-8000-000000000003',
  'Abrigo impermeable para galgos',
  'abrigo-impermeable-galgos',
  'Abrigo ligero para lluvia y frio moderado, con patron alargado.',
  'Una prenda impermeable ayuda a proteger del viento y la lluvia durante paseos cortos. Es importante revisar largo de lomo, pecho y libertad de movimiento.',
  'abrigos',
  'https://www.amazon.es/dp/ASIN_EJEMPLO_3?tag=AFFILIATE_TAG',
  null,
  array['Patron alargado', 'Cobertura para lluvia ligera', 'Facil de poner'],
  array['Puede no bastar en frio intenso', 'La talla depende mucho del largo de lomo'],
  'Galgos frioleros en paseos urbanos con lluvia o viento.',
  true,
  true,
  3
),
(
  '00000000-0000-4000-8000-000000000004',
  'Cama ortopedica grande',
  'cama-ortopedica-grande',
  'Cama amplia y estable para perros grandes que disfrutan estirandose.',
  'Una cama grande y firme ofrece una zona de descanso comoda para perros altos. No se atribuyen beneficios clinicos concretos sin criterio veterinario.',
  'camas',
  'https://www.amazon.es/dp/ASIN_EJEMPLO_4?tag=AFFILIATE_TAG',
  null,
  array['Superficie amplia', 'Base firme', 'Funda practica para el hogar'],
  array['Ocupa espacio', 'La firmeza ideal depende de cada perro'],
  'Galgos adultos que duermen estirados y necesitan una superficie generosa.',
  true,
  true,
  4
),
(
  '00000000-0000-4000-8000-000000000005',
  'Comedero elevado',
  'comedero-elevado-galgo',
  'Soporte elevado para colocar cuencos a una altura mas comoda.',
  'Un comedero elevado puede resultar comodo para perros altos, siempre escogiendo una altura razonable. Ante dudas digestivas o de salud, consulta con un profesional veterinario.',
  'alimentacion',
  'https://www.amazon.es/dp/ASIN_EJEMPLO_5?tag=AFFILIATE_TAG',
  null,
  array['Altura mas accesible', 'Zona de comida ordenada', 'Puede reducir posturas incomodas'],
  array['No es necesario para todos los perros', 'La altura debe elegirse con cuidado'],
  'Galgos altos que comen mejor con el cuenco ligeramente elevado.',
  false,
  true,
  5
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  affiliate_url = excluded.affiliate_url,
  image_url = excluded.image_url,
  pros = excluded.pros,
  cons = excluded.cons,
  recommended_for = excluded.recommended_for,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into articles (
  id,
  title,
  slug,
  excerpt,
  content,
  cover_image_url,
  meta_title,
  meta_description,
  published,
  featured,
  published_at
) values
(
  '00000000-0000-4000-8000-000000000101',
  'Que necesita un galgo recien adoptado',
  'que-necesita-un-galgo-recien-adoptado',
  'Una guia breve para preparar los primeros dias con calma, seguridad y medidas bien tomadas.',
  '# Que necesita un galgo recien adoptado

Los primeros dias conviene priorizar calma, rutina y seguridad. Antes de comprar, toma medidas reales del perro: cuello, pecho, cintura y largo de lomo.

## Basicos utiles

- Un arnes antiescape bien ajustado para los primeros paseos.
- Una cama amplia donde pueda descansar sin encogerse.
- Un abrigo ligero si vive en una zona fria o lluviosa.

La eleccion final depende de las medidas, el caracter y las necesidades del perro. Esta guia no sustituye el criterio de un profesional veterinario.',
  null,
  'Que necesita un galgo recien adoptado',
  'Basicos utiles para preparar la llegada de un galgo recien adoptado sin inventar promesas ni datos no verificados.',
  true,
  true,
  now()
),
(
  '00000000-0000-4000-8000-000000000102',
  'Como elegir arnes antiescape para galgo',
  'como-elegir-arnes-antiescape-para-galgo',
  'Claves para revisar ajuste, medidas y uso responsable de un arnes antiescape.',
  '# Como elegir arnes antiescape para galgo

Un arnes antiescape para galgo suele buscar tres cosas: ajuste estable, libertad de movimiento y materiales comodos para paseos diarios.

## Antes de decidir

- Mide cuello, pecho y cintura con una cinta flexible.
- Revisa que el perro pueda caminar sin rozaduras.
- Comprueba el ajuste en casa antes de un paseo largo.

Ningun arnes evita por si solo todos los riesgos. La eleccion final depende de las medidas y necesidades del perro, y debe acompanarse de un manejo prudente.',
  null,
  'Como elegir arnes antiescape para galgo',
  'Guia editorial para elegir un arnes antiescape para galgo segun medidas, ajuste y uso responsable.',
  true,
  true,
  now()
)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content = excluded.content,
  cover_image_url = excluded.cover_image_url,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  published = excluded.published,
  featured = excluded.featured,
  published_at = excluded.published_at;

insert into article_products (article_id, product_id, sort_order) values
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001', 1),
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000003', 2),
('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000004', 3),
('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001', 1),
('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000002', 2)
on conflict (article_id, product_id) do update set
  sort_order = excluded.sort_order;
