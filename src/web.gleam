import gleam/dynamic
import gleam/int
import gleam/io
import gleam/list
import gleam/option.{None, Some}
import gleam/string
import gleam/uri.{type Uri}
import lustre
import lustre/attribute.{class, href, src}
import lustre/effect.{type Effect}
import lustre/element.{type Element, text}
import lustre/element/html.{a, div, h1, h2, img, nav, p}
import lustre_http.{type HttpError}
import modem
import web/github.{type GitHubProjectRemoteInfo, GitHubProjectRemoteInfo}
import web/projects.{
  type Project, GenericProject, GithubProject, Other, Owner, Work,
}

type Route {
  Home
  Projects
  Articles
}

type Msg {
  OnRouteChange(Route)
  OnGotGitHubProject(Result(GitHubProjectRemoteInfo, HttpError))
}

type Model {
  Model(route: Route, projects: List(Project))
}

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

fn uri_to_route(uri: Uri) -> Route {
  case uri.path_segments(uri.path) {
    ["projects"] -> Projects
    ["articles"] -> Articles
    _ -> Home
  }
}

fn on_url_change(uri: Uri) -> Msg {
  OnRouteChange(uri_to_route(uri))
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
      io.debug(remote_project_info)
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

fn mk_link(link: String, link_text: String) -> Element(a) {
  a([class("text-indigo-500"), href(link)], [text(link_text)])
}

fn mk_page_title(title: String) -> Element(a) {
  // Set the title in a grid and use the grid centering parameter
  div([class("grid pt-2 pb-6 justify-items-center")], [
    h1([class("text-3xl font-bold")], [text(title)]),
  ])
}

fn build_full_name(org: String, name: String) -> String {
  org <> "/" <> name
}

fn mk_github_contrib_link(name: String, org: String) {
  "https://github.com/"
  <> org
  <> "/"
  <> name
  <> "/pulls?q=is%3Apr+is%3Aclosed+author%3Amorucci+"
}

fn get_project(project: Project) -> Effect(Msg) {
  case project {
    GenericProject(..) -> effect.none()
    GithubProject(name, org, _, _, _, Some(_)) -> {
      io.debug(
        "remote infos for alreay for "
        <> build_full_name(org, name)
        <> " already in app state",
      )
      effect.none()
    }
    GithubProject(name, org, _, _, _, None) -> {
      io.debug("fetching remote infos for " <> build_full_name(org, name))
      let decoder =
        dynamic.decode4(
          GitHubProjectRemoteInfo,
          dynamic.field("full_name", dynamic.string),
          dynamic.field("stargazers_count", dynamic.int),
          dynamic.field("language", dynamic.string),
          dynamic.field("description", dynamic.string),
        )
      let url = "https://api.github.com/repos/" <> org <> "/" <> name
      lustre_http.get(url, lustre_http.expect_json(decoder, OnGotGitHubProject))
    }
  }
}

fn view_home(_model) {
  div([], [
    mk_page_title("Welcome on my web page"),
    div([class("flex flex-col gap-2")], [
      div([class("self-center")], [
        img([
          class("rounded-full w-32 h-32"),
          src("https://avatars.githubusercontent.com/u/84583"),
        ]),
      ]),
      div([class("flex flex-col gap-2")], [
        p([], [
          text(
            "My name is Fabien Boucher, I'm currenlty working for Red Hat as a Principal Software Engineer.",
          ),
          text(
            " At work, I maintain the production chain CI infrastructure for OSP (the Red Hat OpenStack Platform) and for",
          ),
          mk_link("https://www.rdoproject.org", " RDO"),
          text(". I contribute to"),
          mk_link("/projects", " various Open Source projects "),
          text("for work and during my free time."),
        ]),
      ]),
    ]),
  ])
}

fn view_project(project: Project) {
  case project {
    GenericProject(
      name,
      desc,
      repo_url,
      langs,
      contrib_desc,
      contrib_link,
      _ptype,
    ) -> {
      div([], [
        div([class("flex justify-between")], [
          mk_link(repo_url, name),
          div([class("flex flex-row gap-2")], [
            case contrib_link {
              Some(link) -> mk_link(link, "(changes)")
              None -> element.none()
            },
            div([], [langs |> string.join("/") |> text]),
          ]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(desc)]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    GithubProject(name, org, contrib_desc, _, show_changes, Some(ri)) -> {
      div([], [
        div([class("flex justify-between")], [
          div([class("flex gap-1")], [
            mk_link("https://github.com/" <> org <> "/" <> name, name),
          ]),
          div([class("flex flex-row gap-2")], [
            case show_changes {
              True ->
                div([], [
                  mk_link(mk_github_contrib_link(name, org), "(changes)"),
                ])
              False -> element.none()
            },
            div([], [text(ri.stars |> int.to_string <> "⭐")]),
            div([], [text(ri.language)]),
          ]),
        ]),
        div([class("grid gap-1")], [
          div([], [text(ri.description)]),
          div([], [text(contrib_desc)]),
        ]),
      ])
    }
    _ -> element.none()
  }
}

fn view_projects(model: Model) {
  let section_title = fn(title: String) {
    h2([class("text-2xl font-bold text-blue-100")], [text(title)])
  }
  div([], [
    div([], [mk_page_title("Projects")]),
    div([class("grid gap-6")], [
      div([class("grid gap-1")], [
        section_title("Projects I have originaly created"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Owner, ..) -> True
                GenericProject(project_type: Owner, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
      div([class("grid gap-1")], [
        section_title("Projects I've contributed to for my employer"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Work, ..) -> True
                GenericProject(project_type: Work, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
      div([class("grid gap-1")], [
        section_title("Projects I've contributed during my free time"),
        div(
          [class("grid gap-2")],
          model.projects
            |> list.filter(fn(p) {
              case p {
                GithubProject(project_type: Other, ..) -> True
                GenericProject(project_type: Other, ..) -> True
                _ -> False
              }
            })
            |> list.map(view_project),
        ),
      ]),
    ]),
  ])
}

fn view_articles(_model) {
  div([], [text("articles")])
}

fn view(model: Model) {
  // Set flex and ensure the container is centered
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
