import * as metador from './map';

declare var Configuration: any;

let context: any = Window;
context.metador = metador;

metador['metadorMap'] = metador.Ol4Map.create(Configuration.spatial);
