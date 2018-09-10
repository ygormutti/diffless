import { Location } from '../../diffless/model';

export function test(val: any): val is Location {
    return val && val instanceof Location;
}

export function print(location: Location): string {
    return location.code;
}
