import { Component, HostListener } from "@angular/core";

@Component({
  selector: "app-container",
  templateUrl: "./container.component.html",
  styleUrls: ["./container.component.scss"],
})
export class ContainerComponent {
  sideBarOpen = true;
  desktopViewWidth: number = 1100;
  drawerMode: "side" | "over" = "side";
  @HostListener("window:resize", ["$event.target.innerWidth"])
  onResize(width: number) {
    if (width < this.desktopViewWidth) {
      this.drawerMode = "over";
      if (this.sideBarOpen) {
        this.sideBarOpen = false;
      }
    } else {
      this.drawerMode = "side";
      if (!this.sideBarOpen) {
        this.sideBarOpen = true;
      }
    }
  }

  constructor() {}

  ngOnInit(): void {
    console.log("Hello world!");
  }

  sideBarToggler() {
    this.sideBarOpen = !this.sideBarOpen;
  }

  drawerOpenChangeHandler = (opened: boolean) => {
    this.sideBarOpen = opened;
  };

  onClickMenu() {
    if (this.drawerMode == "over") {
      this.sideBarOpen = false;
    } else {
      this.sideBarOpen = true;
    }
  }
}
