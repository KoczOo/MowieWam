import {Component, OnInit} from '@angular/core';
import {SlickCarouselModule} from "ngx-slick-carousel";
import {NgForOf} from "@angular/common";
import {GooglePlacesService} from "../../services/google-places.service";
import {Reviews} from "../../dto/Reviews";
import {StarRatingComponent} from "../../components/star-rating/star-rating.component";
import {ActivatedRoute} from "@angular/router";
import {IntersectionObserverDirective} from "../../directive/intersection-observer.directive";


@Component({
  selector: 'app-home',
  imports: [
    SlickCarouselModule,
    NgForOf,
    StarRatingComponent,
    IntersectionObserverDirective
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  isVisible = false;
  slides: Reviews[] = [];
  slideConfig = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    dots: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: true
        },
      },
    ],
  };

  constructor(private route: ActivatedRoute, private GooglePlacesService: GooglePlacesService) {
  }

  onVisible(): void {
    this.isVisible = true;
  }

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.loadPlaceDetails();
    });

  }

  loadPlaceDetails(): void {
    this.GooglePlacesService.getPlaceDetails().subscribe(response => {
      this.slides = response.result.reviews;
    })
  }
}
