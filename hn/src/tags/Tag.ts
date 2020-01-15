import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export default class Tag {

    @IsNotEmpty()
    @IsString()
    private _name: string;

    @IsNumber()
    private _count: number;

    @IsNotEmpty()
    @IsString()
    private _href: string;

    constructor(name: string = "", count: number = 0, href: string = "") {
        this._name = name;
        this._count = count;
        this._href = href;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get count(): number {
        return this._count;
    }

    set count(value: number) {
        this._count = value;
    }

    get href(): string {
        return this._href;
    }

    set href(value: string) {
        this._href = value;
    }
}
