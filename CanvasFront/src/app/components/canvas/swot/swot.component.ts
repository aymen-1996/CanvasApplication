import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-swot',
  templateUrl: './swot.component.html',
  styleUrls: ['./swot.component.css']
})
export class SwotComponent implements OnInit {
  showFirst:boolean=true;
  ngOnInit(): void {
  }
  onShowFirstChange(value: boolean) {
    this.showFirst = value;
  }
}
