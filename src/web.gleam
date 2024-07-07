import lustre
import lustre/element.{text}
import lustre/element/html.{div, p}

pub fn main() {
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

fn init(_flags) {
  0
}

// type Msg

fn update(model, _msg) {
  model
}

fn view(_model) {
  div([], [p([], [text("Fabien website")])])
}
