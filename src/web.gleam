import gleam/io
import gleam/list
import gleam/option.{Some}
import lustre
import lustre/attribute.{class}
import lustre/effect.{type Effect}
import lustre/element/html.{div, nav}
import modem
import web/articles.{view_articles}
import web/home.{view_home}
import web/projects.{get_project, view_projects}
import web/routes.{on_url_change, uri_to_route}
import web/types.{
  type Model, type Msg, type Project, Articles, GithubProject, Home, Model,
  OnGotGitHubProject, OnRouteChange, Projects,
}
import web/utils.{mk_link}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

fn init(_flags) -> #(Model, Effect(Msg)) {
  let route = case modem.initial_uri() {
    Ok(uri) -> uri_to_route(uri)
    Error(_) -> Home
  }
  #(
    Model(route, projects.list()),
    projects.list()
      |> list.map(get_project)
      |> list.append([modem.init(on_url_change)])
      |> effect.batch,
  )
}

fn update(model: Model, msg) -> #(Model, Effect(Msg)) {
  case msg {
    OnRouteChange(route) -> #(Model(..model, route: route), case route {
      Projects -> {
        model.projects |> list.map(get_project) |> effect.batch
      }
      _ -> effect.none()
    })
    OnGotGitHubProject(Ok(remote_project_info)) -> {
      // io.debug(remote_project_info)
      let update_project = fn(project: Project) -> Project {
        case project {
          GithubProject(name, org, contrib_desc, owner, show_changes, _) -> {
            case { org <> "/" <> name == remote_project_info.full_name } {
              True -> {
                GithubProject(
                  name,
                  org,
                  contrib_desc,
                  owner,
                  show_changes,
                  Some(remote_project_info),
                )
              }
              False -> project
            }
          }
          _ -> project
        }
      }
      #(
        Model(..model, projects: model.projects |> list.map(update_project)),
        effect.none(),
      )
    }
    OnGotGitHubProject(Error(err)) -> {
      io.debug(err)
      #(model, effect.none())
    }
  }
}

fn view(model: Model) {
  div(
    [
      class(
        "flex flex-row justify-center min-h-screen bg-zinc-800 text-teal-200",
      ),
    ],
    [
      // Ensure we are not using to full wide size
      div([class("basis-10/12")], [
        div([class("pt-1 w-full max-w-5xl mx-auto")], [
          div([class("p-1 border-2 border-indigo-500 bg-zinc-900")], [
            nav([class("flex gap-2")], [
              mk_link("/", "Home"),
              mk_link("/projects", "Projects"),
              mk_link("/articles", "Articles"),
            ]),
          ]),
          case model.route {
            Home -> view_home(model)
            Projects -> view_projects(model)
            Articles -> view_articles(model)
          },
        ]),
      ]),
    ],
  )
}
