import gleam/uri.{type Uri}
import web/types.{type Msg, type Route, Articles, Home, OnRouteChange, Projects}

pub fn uri_to_route(uri: Uri) -> Route {
  case uri.path_segments(uri.path) {
    ["projects"] -> Projects
    ["articles"] -> Articles
    _ -> Home
  }
}

pub fn on_url_change(uri: Uri) -> Msg {
  OnRouteChange(uri_to_route(uri))
}
