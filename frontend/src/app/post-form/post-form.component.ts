import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { Post } from '../models/Post.model';
import { PostService } from '../services/posts.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {

  postForm!: FormGroup;
  mode!: string;
  loading!: boolean;
  post!: Post;
  errorMsg!: string;
  imagePreview!: string

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private posts: PostService,
              private auth: AuthService) { }

  ngOnInit() {
    this.initModifyForm();
    this.loading = true;
    this.route.params.pipe(
      switchMap(params => {
        if (!params['id']){
          this.mode = 'new';
          this.loading = false;
          return EMPTY;
        } else {
          this.mode = 'edit';
          return this.posts.getOnePost(params['id'])
        }
      }),
      tap(post => {
        if (post) {
          this.post = post;
          this.initModifyForm(post);
          this.loading = false;
        }
      }),
      catchError(error => this.errorMsg = JSON.stringify(error))
    ).subscribe();
  }
 

  initModifyForm(post: Post|null = null) {
    this.postForm = this.formBuilder.group({
      image: [post?.imageUrl, Validators.required],
      text: [post?.text, Validators.required],
    });
    this.imagePreview = this.post?.imageUrl
  }

  onSubmit() {
    this.loading = true;
    const newPost = new Post();
    newPost.text = this.postForm.get('text')!.value;
    newPost.userId = this.auth.getUserId();
    if (this.mode === 'new') {
      this.posts.createPost(newPost, this.postForm.get('image')!.value).pipe().subscribe(() => {
        this.router.navigate(['/post'])
      });
    } else if (this.mode === 'edit') {
      this.posts.modifyPost(this.post._id, newPost, this.postForm.get('image')!.value).pipe().subscribe(() => {
        this.router.navigate(['/post'])
      });
    }
  }

  onFileAdd(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.postForm.get('image')!.setValue(file);
    this.postForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onBack() {
    this.router.navigate(['/post']);
  }
}
