import { useImage } from 'react-image'

const ImageConstruction = ({ url }) => {
    const { src, isLoading } = useImage({
        srcList: url,
        useSuspense: false
    })

    return <img alt="" className={ `imgComponent ${!isLoading && "active"}`} src={src} />
}

const Image = ({ url }) => {

    return url !== undefined && (
            <ImageConstruction url={url} />
    )
}

export default Image