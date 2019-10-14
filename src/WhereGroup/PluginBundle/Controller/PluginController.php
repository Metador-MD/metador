<?php

namespace WhereGroup\PluginBundle\Controller;

use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Filesystem\Filesystem;
use WhereGroup\PluginBundle\Entity\Plugin;
use ZipArchive;

/**
 * Class PluginController
 * @package WhereGroup\PluginBundle\Controller
 * @author A.R.Pour
 * @Route("/admin/plugin")
 */
class PluginController extends Controller
{
    /**
     * @Route("/", name="metador_admin_plugin", methods={"GET"})
     */
    public function indexAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return $this->render('MetadorPluginBundle:Plugin:index.html.twig', [
            'plugins' => $this->get('metador_plugin')->init()->getPlugins('origin')
        ]);
    }

    /**
     * @Route("/update", name="metador_admin_plugin_update", methods={"POST"})
     * @param Request $request
     * @return Response
     */
    public function updateAction(Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $plugins = [];
        $array   = $request->request->all();

        foreach ($array['plugin'] as $key => $value) {
            if ($value == 1) {
                $plugins[] = $key;
            }
        }

        return $this->render('MetadorPluginBundle:Plugin:update.html.twig', [
            'plugins' => implode(',', $plugins)
        ]);
    }

    /**
     * @Route("/import", name="metador_admin_plugin_import", methods={"GET"})
     */
    public function importAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return $this->render('MetadorPluginBundle:Plugin:import.html.twig', [
            'form' => $this
                ->createFormBuilder(new Plugin())
                ->add('attachment', FileType::class, [
                    'label' => 'Datei', 'label_attr' => ['class' => 'plugin-label plugin-row'],
                    'attr' => ['class' => 'plugin-row']
                ])
                ->add('save', SubmitType::class, ['label' => 'Importieren', 'attr' => [
                    'class' => 'plugin-row'
                ]])
                ->getForm()
                ->createView()
        ]);
    }

    /**
     * @Route("/upload", name="metador_admin_plugin_upload", methods={"POST"})
     * @param Request $request
     * @return RedirectResponse|Response
     */
    public function uploadAction(Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $kernelPath = $this->get('kernel')->getRootDir();

        $pluginPath = $kernelPath . '/../src/Plugins/';
        $tempPath   = $kernelPath . '/../var/temp/';

        $form = $this->createFormBuilder(new Plugin())
            ->add('attachment', FileType::class, [
                'label' => 'Datei', 'label_attr' => ['class' => 'plugin-label plugin-row'],
                'attr' => ['class' => 'plugin-row']
            ])
            ->add('save', SubmitType::class, ['label' => 'Importieren', 'attr' => ['class' => 'plugin-row']])
            ->getForm();

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var UploadedFile $file */
            $file = $form['attachment']->getData();

            if (!$file instanceof UploadedFile) {
                $this->log('error', 'upload', '', 'Datei-Upload ist fehlgeschlagen.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            // get extension
            $extension = $file->guessExtension();

            if (!$extension || $extension !== 'zip') {
                $this->log('error', 'upload', '', 'Hochgeladene Datei ist kein Metador Plugin.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            $pluginFile = $file->move($tempPath, $file->getFilename());

            unset($file);

            // extract to temp folder
            $zip = new ZipArchive;

            if ($zip->open($pluginFile->getRealPath()) !== true) {
                $this->log('error', 'upload', '', 'Entpacken fehlgeschlagen.');
                return $this->redirectToRoute('metador_admin_plugin');
            }

            $tempFolder = $tempPath . $pluginFile->getFilename() . '_dir';
            $zip->extractTo($tempFolder);
            $zip->close();

            $fs = new Filesystem();

            // remove uploaded file
            $fs->remove($pluginFile->getRealPath());

            // find bundles
            $finder = new Finder();
            $finder->in($tempFolder)->directories()->name('*Bundle');

            foreach ($finder as $folder) {
                /** @var SplFileInfo $folder  */
                $copyPath = $pluginPath . $folder->getRelativePath() . '/';

                if (!$fs->exists($pluginPath)) {
                    $fs->mkdir($copyPath, 0644, true);
                }

                if ($fs->exists($copyPath . '/' . $folder->getFilename())) {
                    $this->log('error', 'upload', '', 'Plugin ist existiert bereits.');
                } else {
                    $fs->mirror($folder->getRealPath(), $copyPath . $folder->getFilename());
                }
            }

            $fs->remove($tempFolder);

            return $this->redirectToRoute('metador_admin_plugin');
        }

        return $this->render('MetadorPluginBundle:Plugin:import.html.twig', [
            'form' => $form->createView()
        ]);
    }

    /**
     * @Route("/confirm/{plugin}", name="metador_admin_plugin_confirm", methods={"GET"})
     * @param $plugin
     * @return Response
     */
    public function confirmAction($plugin)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return $this->render('MetadorPluginBundle:Plugin:confirm.html.twig', [
            'pluginKey' => $plugin
        ]);
    }

    /**
     * @Route("/delete/{plugin}", name="metador_admin_plugin_delete", methods={"POST"})
     * @param $plugin
     * @return RedirectResponse
     */
    public function deleteAction($plugin)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        $this->get('metador_plugin')->init()->delete($plugin);

        return $this->redirectToRoute('metador_admin_plugin');
    }

    /**
     * @Route("/view/{plugin}", name="metador_admin_plugin_view", methods={"GET", "POST"})
     * @param $plugin
     * @return Response
     */
    public function viewAction($plugin)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        // Show template if exists
        if ($this->get('templating')->exists($plugin . ':Plugin:view.html.twig')) {
            return $this->forward($plugin . ':Plugin:view');
        }

        return $this->render('MetadorPluginBundle:Plugin:view.html.twig');
    }

    /**
     * @Route("/command/config", name="metador_admin_plugin_command_config", methods={"POST"})
     * @param Request $request
     * @return JsonResponse
     */
    public function configAction(Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return new JsonResponse($this->get('metador_plugin')->init()->update($request->request->all()));
    }

    /**
     * @Route("/command/assets", name="metador_admin_plugin_command_assets", methods={"POST"})
     */
    public function assetsAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return new JsonResponse($this->get('metador_plugin')->assetsInstall());
    }

    /**
     * @Route("/command/database", name="metador_admin_plugin_command_database", methods={"POST"})
     */
    public function databaseAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return new JsonResponse($this->get('metador_plugin')->doctrineUpdate());
    }

    /**
     * @Route("/command/cache", name="metador_admin_plugin_command_cache", methods={"POST"})
     */
    public function cacheAction()
    {
        $this->denyAccessUnlessGranted('ROLE_SYSTEM_SUPERUSER');

        return new JsonResponse($this->get('metador_plugin')->clearCache());
    }

    /**
     * @param $operation
     * @param $id
     * @param $message
     * @param array $parameter
     */
    private function log($type, $operation, $id, $message, $parameter = [])
    {
        $log = $this->get('metador_logger')->newLog();

        $log->setType($type)
            ->setMessage($message, $parameter)
            ->setFlashMessage()
            ->setCategory('system')
            ->setOperation($operation)
            ->setIdentifier($id);

        $this->get('metador_logger')->set($log);

        unset($log);
    }
}
