import mongoose from 'mongoose';

export class MoviePass {
  constructor(
    public _id: string | null,
    public userId: string,
    public status: 'Active' | 'Inactive',
    public history: Array<{ title: string; date: Date; saved: number }>,
    public purchaseDate: Date,
    public expireDate: Date,
    public moneySaved: number,
    public totalMovies: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}

export class MoviePassHistory {
  constructor(
    public title: string,
    public date: Date,
    public saved: number,
  ) {}
}
