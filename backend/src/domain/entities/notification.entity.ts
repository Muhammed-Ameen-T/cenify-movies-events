export class Notification {
  constructor(
    public _id: string,
    public userId: string | null,
    public title: string,
    public type: string,
    public description: string,
    public bookingId?: string | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public isRead: boolean = false,
    public isGlobal: boolean = false,
    public readedUsers: string[] = [],
  ) {}
}
