export interface IVideo {
  id: number;
  name: string;
  publishedAt: string;
  updatedAt: string;

  prevent?: IVideo;
  next?: IVideo;

  poster: IMedia;
  video: IMedia;
  group?: IGroup;
  main: boolean;
  duration: number;
  description?: string;
}

export interface IGroup {
  id: number;
  name: string;
  publishedAt: string;
  updatedAt: string;
  poster: IMedia;
  parent?: IGroup;
  children: IGroup[];
  videos: IVideo[];
  main: boolean;
  description?: string;
}

export interface IMedia {
  id: number;
  name: string;
  alternativeText?: string;
  width: number;
  height: number;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}
