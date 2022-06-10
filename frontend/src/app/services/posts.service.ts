import { Injectable } from '@angular/core';
import { catchError, map, mapTo, of, Subject, tap, throwError } from 'rxjs';
import { Post } from '../models/Post.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable ({
    providedIn: 'root'
})
export class PostService {
    posts$ = new Subject<Post[]>();

    constructor(private http: HttpClient,
                private auth: AuthService) {}

    getAllPost() {
        this.http.get<Post[]>('http://localhost:3000/post').pipe(
            tap(posts => this.posts$.next(posts)),
            catchError(error => {
                console.error(error.error.message);
                return of([]);
            })
        ).subscribe();
    }

    getOnePost(id: string) {
        return this.http.get<Post>('http://localhost:3000/post/' + id).pipe(
            catchError(error => throwError(error.error.message))
        );
    }

    likePost(id: string, likes: boolean) {
        return this.http.post<{ message: string }>(
            'http://localhost:3000/post/' + id + '/likes',
            { userId: this.auth.getUserId(), like: likes ? -1 : 0 }
        ).pipe(
            mapTo(likes),
            catchError(error => throwError(error.error.message))
        );
    }

    dislikePost(id: string, dislikes: boolean) {
        return this.http.post<{ message: string }>(
            'http://locqlhost:3000/post/' +id + '/like',
            { userId: this.auth.getUserId(), like: dislikes ? -1 : 0 }
        ).pipe(
            mapTo(dislikes),
            catchError(error => throwError(error.error.message))
        );
    }

    createPost(post: Post, image: File) {
        const formData = new FormData();
        formData.append('post', JSON.stringify(post));
        formData.append('images', image);
        return this.http.post<{ message: string}>('http://locqlhost:3000/post', formData).pipe(
            catchError(error => (error.error.message))
        );
    }

    modifyPost(id: string, post: Post, image: string | File) {
        if(typeof image === 'string') {
            return this.http.put<{ message: string }>('http://localhost:3000/post/' + id, post).pipe(
                catchError(error => (error.error.message))
            );
        } else {
            const formData = new FormData();
            formData.append('post', JSON.stringify(post));
            formData.append('image', image);
            return this.http.put<{ message: string }>('http://localhost:3000/post/' + id, formData).pipe(
                catchError(error => throwError(error.error.message))
      );
        }
    }
}