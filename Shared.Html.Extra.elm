module Shared.Html.Extra exposing (customElementComponent, customElementTransclude, empty)

import Html exposing (Html)


{-| Empty node. Useful when we want to view nothing =)
-}
empty : Html msg
empty =
    Html.text ""


{-| Creates a placeholder for custom element component. Later AngularJS component will be embed to this element.
-}
customElementComponent : Html msg
customElementComponent =
    Html.node "custom-element-component" [] []


{-| Creates a placeholder for custom element component transclusions. Later it will be copied to AngularJS so it can use it for transclusion.
-}
customElementTransclude : List (Html Never) -> Html msg
customElementTransclude =
    Html.map never << Html.node "custom-element-transclude" [ Attrs.style "display" "none" ]
