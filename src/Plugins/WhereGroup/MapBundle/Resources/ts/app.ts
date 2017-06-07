import * as metador from './map';

let context: any = Window;
context.metador = metador;

declare var Configuration: any;

metador['metadorMap'] = metador.Ol4Map.create(Configuration.spatial);
